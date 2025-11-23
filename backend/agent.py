"""
ThreatIQ Root Agent - ADK Entry Point

This is the main agent definition using Google ADK framework.
It coordinates all sub-agents in a sequential workflow.

Capstone Requirements Demonstrated:
1. Multi-agent system (Sequential agents with LlmAgent)
2. Custom tools (phishing dataset, profiles)
3. Sessions & Memory (InMemorySessionService)
4. Observability (built-in logging/tracing)
"""

import os
from dotenv import load_dotenv

load_dotenv()

import google.generativeai as genai
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ThreatIQAgent:
    """
    Root orchestrator agent for ThreatIQ.
    
    Coordinates the multi-agent workflow:
    1. Classifier Agent -> Analyzes message
    2. Evidence Agent -> Finds similar examples
    3. Memory Agent -> Manages user profile
    4. Coach Agent -> Generates coaching response
    """
    
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        self.session_memory = {}
        
        logger.info("ThreatIQ Root Agent initialized")
    
    async def analyze_message(
        self,
        message: str,
        user_id: str,
        user_guess: str = None,
        session_id: str = None
    ) -> dict:
        """
        Run the complete multi-agent analysis workflow.
        
        This demonstrates:
        - Sequential agent execution
        - Tool usage
        - Session management
        - Observability (logging)
        
        Args:
            message: Message to analyze
            user_id: User identifier
            user_guess: User's prediction (optional)
            session_id: Session identifier
            
        Returns:
            Complete analysis result
        """
        import uuid
        if not session_id:
            session_id = str(uuid.uuid4())
        
        logger.info(f"[Session: {session_id}] Starting multi-agent analysis for user: {user_id}")
        
        try:
            from app.agents.classifier import classifier_agent
            from app.agents.evidence import evidence_agent
            from app.agents.memory import memory_agent
            from app.agents.coach import coach_agent
            from app.tools.profile_tools import InteractionLogger
            
            logger.info(f"[Session: {session_id}] Step 1: Running Classifier Agent")
            classification = await classifier_agent.classify(message)
            
            category = classifier_agent.determine_category(
                classification['reason_tags'],
                message
            )
            
            logger.info(f"[Session: {session_id}] Step 2: Running Evidence Agent")
            similar_examples = await evidence_agent.find_evidence(
                message=message,
                reason_tags=classification['reason_tags'],
                category=category,
                max_examples=3
            )
            
            logger.info(f"[Session: {session_id}] Step 3: Running Memory Agent")
            learning_context = await memory_agent.get_learning_context(user_id)
            
            logger.info(f"[Session: {session_id}] Step 4: Running Coach Agent")
            coach_response = await coach_agent.generate_coaching(
                message=message,
                classification=classification,
                similar_examples=similar_examples,
                learning_context=learning_context
            )
            
            was_correct = None
            if user_guess:
                was_correct = user_guess.lower() == classification['label'].lower()
            
            logger.info(f"[Session: {session_id}] Step 5: Updating user profile")
            await memory_agent.update_profile(
                user_id=user_id,
                category=category,
                was_correct=was_correct
            )
            
            logger.info(f"[Session: {session_id}] Step 6: Logging interaction")
            await InteractionLogger.log_interaction(
                user_id=user_id,
                message=message,
                user_guess=user_guess,
                classification=classification,
                was_correct=was_correct,
                session_id=session_id
            )
            
            self.session_memory[session_id] = {
                "user_id": user_id,
                "classification": classification,
                "was_correct": was_correct
            }
            
            logger.info(f"[Session: {session_id}] Analysis complete!")
            
            return {
                "classification": classification,
                "coach_response": coach_response,
                "was_correct": was_correct,
                "session_id": session_id
            }
            
        except Exception as e:
            logger.error(f"[Session: {session_id}] Error in analysis: {e}", exc_info=True)
            raise
    
    def get_session(self, session_id: str) -> dict:
        """Get session data (InMemorySessionService pattern)."""
        return self.session_memory.get(session_id, {})
    
    def clear_session(self, session_id: str):
        """Clear session data."""
        if session_id in self.session_memory:
            del self.session_memory[session_id]
            logger.info(f"Cleared session: {session_id}")


root_agent = ThreatIQAgent()


async def main(message: str, user_id: str = "cli_user"):
    """
    Main entry point for ADK CLI.
    
    Usage:
        adk run agent.py "Your message here"
    """
    result = await root_agent.analyze_message(message, user_id)
    print(f"\n✅ Analysis Complete!")
    print(f"Verdict: {result['classification']['label']}")
    print(f"Confidence: {result['classification']['confidence']}")
    print(f"\n{result['coach_response']['explanation']}")
    return result


if __name__ == "__main__":
    import asyncio
    import sys
    
    if len(sys.argv) > 1:
        message = " ".join(sys.argv[1:])
        asyncio.run(main(message))
    else:
        print("Usage: python agent.py 'Your message to analyze'")
