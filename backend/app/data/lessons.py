"""
Daily Micro-Lessons Catalog for ThreatIQ

12 cybersecurity hygiene lessons with quizzes.
Each lesson is ~2-3 minutes of content + 3 MCQ questions.
"""

LESSONS = [
    {
        "lesson_id": "passwords-101",
        "title": "Creating Strong Passwords",
        "topic": "passwords",
        "content": [
            "A strong password is your first line of defense against hackers. The best passwords are at least 12 characters long and include a mix of uppercase letters, lowercase letters, numbers, and special characters. Avoid using personal information like birthdays, names, or common words that can be easily guessed.",
            "One effective technique is to use a passphrase - a series of random words strung together. For example, 'correct-horse-battery-staple' is much stronger than 'P@ssw0rd123' because its length makes it harder to crack, even though it's easier to remember.",
            "Never reuse passwords across different accounts. If one account gets compromised, hackers will try that same password on all your other accounts. Using a password manager helps you generate and store unique passwords for every site."
        ],
        "quiz": [
            {
                "question": "What is the minimum recommended length for a strong password?",
                "options": ["6 characters", "8 characters", "12 characters", "4 characters"],
                "correct_index": 2,
                "explanation": "Security experts recommend at least 12 characters for strong passwords."
            },
            {
                "question": "Why should you avoid reusing passwords?",
                "options": [
                    "It's hard to remember them",
                    "If one account is hacked, all accounts with that password are vulnerable",
                    "Websites don't allow it",
                    "It makes typing slower"
                ],
                "correct_index": 1,
                "explanation": "When you reuse passwords, a breach at one site exposes all your accounts."
            },
            {
                "question": "What makes 'correct-horse-battery-staple' a strong password?",
                "options": [
                    "It has special characters",
                    "It's short and memorable",
                    "Its length makes it hard to crack",
                    "It contains numbers"
                ],
                "correct_index": 2,
                "explanation": "Long passphrases are strong because their length creates billions of possible combinations."
            }
        ]
    },
    {
        "lesson_id": "2fa-basics",
        "title": "Two-Factor Authentication Explained",
        "topic": "2fa",
        "content": [
            "Two-factor authentication (2FA) adds an extra layer of security beyond just your password. It requires something you know (your password) and something you have (like your phone) to log in. Even if someone steals your password, they can't access your account without the second factor.",
            "There are several types of 2FA: SMS codes sent to your phone, authenticator apps like Google Authenticator or Authy, and hardware security keys like YubiKey. Authenticator apps are more secure than SMS because phone numbers can be hijacked through SIM swapping attacks.",
            "Enable 2FA on your most important accounts first: email, banking, and social media. Your email is especially critical because it's often used to reset passwords for other accounts. Most services offer 2FA in their security settings."
        ],
        "quiz": [
            {
                "question": "What does 2FA stand for?",
                "options": [
                    "Two-Factor Authentication",
                    "Two-File Access",
                    "Two-Form Authorization",
                    "Twin-Factor Analysis"
                ],
                "correct_index": 0,
                "explanation": "2FA stands for Two-Factor Authentication."
            },
            {
                "question": "Why are authenticator apps more secure than SMS codes?",
                "options": [
                    "They're faster to use",
                    "SMS can be intercepted through SIM swapping attacks",
                    "They don't need internet",
                    "They have more digits"
                ],
                "correct_index": 1,
                "explanation": "SMS codes can be stolen if hackers convince your carrier to transfer your number to their SIM."
            },
            {
                "question": "Which account should you prioritize for 2FA?",
                "options": [
                    "Gaming accounts",
                    "Email accounts",
                    "Streaming services",
                    "Forum accounts"
                ],
                "correct_index": 1,
                "explanation": "Email is critical because it's used to reset passwords for most other accounts."
            }
        ]
    },
    {
        "lesson_id": "phishing-links",
        "title": "Spotting Phishing Links",
        "topic": "links",
        "content": [
            "Phishing links are designed to look legitimate but lead to malicious websites. Before clicking any link, hover over it to see the actual URL. Phishers often use tricks like replacing letters (amaz0n.com), adding extra words (amazon-secure-login.com), or using different domains (amazon.account-verify.com).",
            "Check for HTTPS, but don't rely on it alone - even malicious sites can have HTTPS now. Look at the domain name carefully: the real domain is right before the .com (or .org, etc.). In 'security.paypal.com', PayPal is the real domain. In 'paypal.security-check.com', security-check is the real domain!",
            "When in doubt, don't click the link. Instead, go directly to the website by typing the address in your browser or using a bookmark. This simple habit can protect you from even sophisticated phishing attempts."
        ],
        "quiz": [
            {
                "question": "What should you do before clicking a link in an email?",
                "options": [
                    "Click it immediately to check",
                    "Hover over it to see the real URL",
                    "Forward it to friends",
                    "Reply to the sender"
                ],
                "correct_index": 1,
                "explanation": "Hovering reveals the true destination URL before you click."
            },
            {
                "question": "In 'paypal.security-check.com', what is the real domain?",
                "options": [
                    "paypal",
                    "security-check",
                    "com",
                    "paypal.security-check"
                ],
                "correct_index": 1,
                "explanation": "The real domain is directly before the TLD (.com). Here it's security-check, not PayPal!"
            },
            {
                "question": "Is HTTPS a guarantee that a site is safe?",
                "options": [
                    "Yes, always",
                    "No, malicious sites can also use HTTPS",
                    "Only for banks",
                    "Only on weekdays"
                ],
                "correct_index": 1,
                "explanation": "HTTPS means the connection is encrypted, but the site itself could still be malicious."
            }
        ]
    },
    {
        "lesson_id": "email-attachments",
        "title": "Safe Handling of Email Attachments",
        "topic": "attachments",
        "content": [
            "Email attachments are a common way for malware to spread. Be especially cautious with executable files (.exe, .bat, .cmd), scripts (.js, .vbs), and office documents with macros (.docm, .xlsm). Even seemingly harmless files like PDFs can contain malware.",
            "Never open attachments from unknown senders. Even if the sender appears familiar, verify unexpected attachments through another channel - their account may have been compromised. Look out for urgency tactics like 'URGENT: Invoice attached' or 'Your order confirmation'.",
            "Keep your antivirus updated and let it scan attachments automatically. Many email providers also scan attachments, but don't rely solely on this. When possible, ask senders to share documents through secure cloud services instead of email attachments."
        ],
        "quiz": [
            {
                "question": "Which file extension is commonly used for malware?",
                "options": [".txt", ".jpg", ".exe", ".mp3"],
                "correct_index": 2,
                "explanation": ".exe files are executable programs and can run malicious code directly."
            },
            {
                "question": "What should you do if a friend sends an unexpected attachment?",
                "options": [
                    "Open it immediately - it's from a friend",
                    "Verify with them through another channel before opening",
                    "Forward it to others to check",
                    "Delete your email account"
                ],
                "correct_index": 1,
                "explanation": "Their account might be hacked. Always verify unexpected attachments through another channel."
            },
            {
                "question": "Which is safer for sharing documents?",
                "options": [
                    "Email attachments",
                    "USB drives from strangers",
                    "Secure cloud services with access controls",
                    "Random file-sharing websites"
                ],
                "correct_index": 2,
                "explanation": "Cloud services with proper access controls provide better security than email attachments."
            }
        ]
    },
    {
        "lesson_id": "software-updates",
        "title": "Why Software Updates Matter",
        "topic": "updates",
        "content": [
            "Software updates aren't just about new features - they contain critical security patches. Hackers constantly search for vulnerabilities in software, and when they find them, developers race to release fixes. Every day you delay an update, you remain vulnerable to known exploits.",
            "Enable automatic updates whenever possible. This ensures you get security patches as soon as they're available. Prioritize updates for your operating system, web browser, and any software that connects to the internet - these are the most common attack targets.",
            "Be careful about update notifications that appear while browsing - these could be fake! Real updates come through your operating system's update mechanism or the software's built-in updater. Never download updates from random websites."
        ],
        "quiz": [
            {
                "question": "Why are software updates important for security?",
                "options": [
                    "They add new emojis",
                    "They fix vulnerabilities that hackers can exploit",
                    "They make software slower",
                    "They change the logo"
                ],
                "correct_index": 1,
                "explanation": "Updates patch security holes that attackers could otherwise exploit."
            },
            {
                "question": "Which software should you prioritize updating?",
                "options": [
                    "Games",
                    "Calculator apps",
                    "Operating system and web browser",
                    "Music players"
                ],
                "correct_index": 2,
                "explanation": "OS and browsers are top targets because they're always connected to the internet."
            },
            {
                "question": "Where should you download updates from?",
                "options": [
                    "Any website offering the update",
                    "Official sources like the OS updater or software's built-in updater",
                    "Email attachments",
                    "Social media links"
                ],
                "correct_index": 1,
                "explanation": "Only trust official update mechanisms - fake update popups are common malware tricks."
            }
        ]
    },
    {
        "lesson_id": "public-wifi",
        "title": "Staying Safe on Public WiFi",
        "topic": "devices",
        "content": [
            "Public WiFi networks at cafes, airports, and hotels are convenient but risky. Attackers can easily set up fake hotspots with names like 'Free Airport WiFi' or snoop on unencrypted traffic. Assume that anything you do on public WiFi could potentially be seen by others.",
            "Always use a VPN (Virtual Private Network) when connecting to public WiFi. A VPN encrypts all your traffic, making it unreadable even if someone intercepts it. Many VPN services offer free tiers that are sufficient for occasional use.",
            "Avoid accessing sensitive accounts like banking on public WiFi, even with a VPN. Disable auto-connect to WiFi networks and forget networks after use. Consider using your phone's cellular data for sensitive tasks - it's generally more secure than public WiFi."
        ],
        "quiz": [
            {
                "question": "What's a common attack on public WiFi?",
                "options": [
                    "Free coffee",
                    "Fake hotspots that steal your data",
                    "Slow download speeds",
                    "Too many users"
                ],
                "correct_index": 1,
                "explanation": "Attackers create fake hotspots with legitimate-sounding names to intercept traffic."
            },
            {
                "question": "What does a VPN do on public WiFi?",
                "options": [
                    "Makes internet faster",
                    "Encrypts your traffic so others can't read it",
                    "Gives you free movies",
                    "Blocks all websites"
                ],
                "correct_index": 1,
                "explanation": "VPNs encrypt all your traffic, protecting it from snoopers on the network."
            },
            {
                "question": "Which is safer for banking on the go?",
                "options": [
                    "Public WiFi without VPN",
                    "Random open networks",
                    "Your phone's cellular data",
                    "Hotel lobby WiFi"
                ],
                "correct_index": 2,
                "explanation": "Cellular data is generally more secure than public WiFi for sensitive tasks."
            }
        ]
    },
    {
        "lesson_id": "social-engineering",
        "title": "Recognizing Social Engineering",
        "topic": "links",
        "content": [
            "Social engineering attacks manipulate people rather than technology. Attackers exploit emotions like fear, urgency, curiosity, or helpfulness. Common tactics include impersonating authority figures (IT support, your boss, police) or creating fake emergencies (your account will be deleted!).",
            "Be suspicious of unsolicited contact, especially when someone creates urgency or asks for sensitive information. Legitimate organizations won't pressure you for immediate action or ask for passwords over phone or email. Take time to verify - call back using official numbers.",
            "Watch for pretexting: attackers who build elaborate stories to gain your trust. They might pose as new employees, IT contractors, or delivery people. Question unusual requests even from seemingly legitimate sources, and follow proper verification procedures."
        ],
        "quiz": [
            {
                "question": "What is social engineering?",
                "options": [
                    "Building social networks",
                    "Manipulating people to bypass security",
                    "Engineering software",
                    "Creating dating profiles"
                ],
                "correct_index": 1,
                "explanation": "Social engineering exploits human psychology rather than technical vulnerabilities."
            },
            {
                "question": "Which is a red flag for social engineering?",
                "options": [
                    "Polite introduction",
                    "Extreme urgency and pressure to act immediately",
                    "Scheduled meeting invites",
                    "Detailed documentation"
                ],
                "correct_index": 1,
                "explanation": "Urgency is used to prevent victims from thinking critically or verifying requests."
            },
            {
                "question": "Someone claiming to be IT support asks for your password. What should you do?",
                "options": [
                    "Give it immediately - they're IT",
                    "Ask them to wait while you give it to a colleague first",
                    "Never share it - legitimate IT never asks for passwords",
                    "Write it down and mail it"
                ],
                "correct_index": 2,
                "explanation": "Real IT staff never need your password - they have admin access to help you."
            }
        ]
    },
    {
        "lesson_id": "password-managers",
        "title": "Using Password Managers",
        "topic": "passwords",
        "content": [
            "Password managers solve the impossible task of remembering unique, strong passwords for every account. They securely store all your passwords in an encrypted vault, protected by one master password. You only need to remember one password, and the manager handles the rest.",
            "Popular password managers include Bitwarden (free and open-source), 1Password, and LastPass. They can generate strong random passwords, auto-fill login forms, and sync across all your devices. Most also warn you about weak, reused, or compromised passwords.",
            "Choose a very strong master password since it protects everything. Enable 2FA on your password manager for extra security. Despite concerns about 'all eggs in one basket', using a password manager is far safer than reusing weak passwords across sites."
        ],
        "quiz": [
            {
                "question": "What is the main benefit of a password manager?",
                "options": [
                    "It makes passwords shorter",
                    "It stores unique, strong passwords for every account",
                    "It removes the need for passwords",
                    "It shares passwords with friends"
                ],
                "correct_index": 1,
                "explanation": "Password managers let you have unique, strong passwords without memorizing them all."
            },
            {
                "question": "Which password manager is free and open-source?",
                "options": ["1Password", "LastPass", "Bitwarden", "Dashlane"],
                "correct_index": 2,
                "explanation": "Bitwarden is a popular free, open-source password manager."
            },
            {
                "question": "What should you do to protect your password manager?",
                "options": [
                    "Use a weak master password for convenience",
                    "Use a strong master password and enable 2FA",
                    "Share your master password with family",
                    "Write the master password on a sticky note"
                ],
                "correct_index": 1,
                "explanation": "Your master password protects everything, so make it strong and add 2FA."
            }
        ]
    },
    {
        "lesson_id": "backup-basics",
        "title": "Backing Up Your Data",
        "topic": "devices",
        "content": [
            "Backups are your insurance against ransomware, hardware failure, theft, and accidents. The 3-2-1 rule recommends: 3 copies of your data, on 2 different types of media, with 1 copy stored offsite. This ensures no single disaster can destroy all your data.",
            "Cloud backup services like Google Drive, iCloud, or Backblaze automatically sync your files. For local backups, external hard drives or NAS devices work well. Test your backups regularly - a backup you can't restore from is worthless!",
            "Keep at least one backup disconnected from your computer and network. Ransomware can encrypt connected backup drives too. Consider keeping an offline backup that you update monthly for your most critical files."
        ],
        "quiz": [
            {
                "question": "What is the 3-2-1 backup rule?",
                "options": [
                    "Back up 3 times a day",
                    "3 copies, 2 media types, 1 offsite",
                    "Use 3 hard drives",
                    "Back up once every 3 months"
                ],
                "correct_index": 1,
                "explanation": "The 3-2-1 rule ensures redundancy and protection against various disaster scenarios."
            },
            {
                "question": "Why keep an offline backup?",
                "options": [
                    "It's faster",
                    "Ransomware can't encrypt a disconnected drive",
                    "It uses less electricity",
                    "It's easier to share"
                ],
                "correct_index": 1,
                "explanation": "Disconnected backups are safe from ransomware that encrypts all connected drives."
            },
            {
                "question": "How often should you test your backups?",
                "options": [
                    "Never - just trust them",
                    "Regularly - untested backups might fail when needed",
                    "Only after a disaster",
                    "Once when you set them up"
                ],
                "correct_index": 1,
                "explanation": "Regular testing ensures your backups actually work when you need them."
            }
        ]
    },
    {
        "lesson_id": "mobile-security",
        "title": "Securing Your Smartphone",
        "topic": "devices",
        "content": [
            "Your smartphone contains emails, photos, banking apps, and access to most of your accounts. Protect it with a strong PIN (6+ digits), pattern, or biometrics. Enable auto-lock after 30 seconds of inactivity. Never leave your phone unlocked in public.",
            "Only install apps from official stores (Google Play, App Store) and review the permissions they request. A flashlight app doesn't need access to your contacts! Regularly review and revoke unnecessary permissions in your phone's settings.",
            "Enable Find My Device (iPhone) or Find My Phone (Android) so you can locate, lock, or wipe your phone remotely if it's lost or stolen. Also enable automatic updates for your phone's operating system and apps to get security patches promptly."
        ],
        "quiz": [
            {
                "question": "What's a good minimum PIN length for your phone?",
                "options": ["2 digits", "4 digits", "6 digits", "No PIN needed"],
                "correct_index": 2,
                "explanation": "Longer PINs are exponentially harder to guess. 6+ digits is recommended."
            },
            {
                "question": "Why review app permissions?",
                "options": [
                    "To make the phone faster",
                    "To prevent apps from accessing data they don't need",
                    "To uninstall apps",
                    "To see ads"
                ],
                "correct_index": 1,
                "explanation": "Apps may request more permissions than necessary - review and restrict them."
            },
            {
                "question": "What should you do if your phone is lost?",
                "options": [
                    "Do nothing",
                    "Buy a new one immediately",
                    "Use Find My Device to locate, lock, or wipe it",
                    "Post about it on social media"
                ],
                "correct_index": 2,
                "explanation": "Find My Device helps you locate and protect your data if your phone is missing."
            }
        ]
    },
    {
        "lesson_id": "privacy-settings",
        "title": "Social Media Privacy",
        "topic": "links",
        "content": [
            "Social media profiles often reveal more than you realize. Birthdays, pet names, schools, and workplaces are common password hints and security question answers. Attackers mine this information for targeted phishing and social engineering attacks.",
            "Review your privacy settings on each platform. Set profiles to private, limit who can see your posts and friend list, and disable location tagging. Be selective about friend requests - fake profiles are used for reconnaissance and scams.",
            "Think before you post. That vacation announcement tells burglars your home is empty. Work complaints might reach your boss. Photos can reveal your location through metadata. The internet never forgets - assume anything you post could become public."
        ],
        "quiz": [
            {
                "question": "Why is sharing your birthday on social media risky?",
                "options": [
                    "You'll get too many wishes",
                    "It's often used as a security question answer",
                    "People will buy you gifts",
                    "It's not risky at all"
                ],
                "correct_index": 1,
                "explanation": "Birthdays are commonly used in security questions and password hints."
            },
            {
                "question": "Why disable location tagging on posts?",
                "options": [
                    "It uses more data",
                    "It reveals where you are (or aren't, like during vacation)",
                    "Photos look better without it",
                    "It's required by law"
                ],
                "correct_index": 1,
                "explanation": "Location tags can reveal patterns and when your home is empty."
            },
            {
                "question": "What should you assume about anything you post online?",
                "options": [
                    "It's completely private",
                    "Only friends can see it",
                    "It could become public and permanent",
                    "It disappears after 24 hours"
                ],
                "correct_index": 2,
                "explanation": "Privacy settings can change, accounts can be hacked - assume everything could go public."
            }
        ]
    },
    {
        "lesson_id": "secure-shopping",
        "title": "Safe Online Shopping",
        "topic": "links",
        "content": [
            "Online shopping scams cost consumers billions yearly. Before buying from an unfamiliar site, research it: check reviews on independent sites, look for a physical address and phone number, and search for scam reports. Prices that are too good to be true usually are.",
            "Use credit cards instead of debit cards online - they offer better fraud protection. Many banks offer virtual card numbers for online purchases. Never save payment information on websites unless absolutely necessary, and use a password manager to fill details instead.",
            "Watch for fake shopping apps and sites during sales events like Black Friday. Stick to official store apps downloaded from official app stores. Check URLs carefully - scammers create sites like 'amaz0n-deals.com' to steal payment info."
        ],
        "quiz": [
            {
                "question": "Why use credit cards instead of debit cards online?",
                "options": [
                    "They have no limits",
                    "Better fraud protection",
                    "Lower interest rates",
                    "Free shipping"
                ],
                "correct_index": 1,
                "explanation": "Credit cards offer stronger consumer protections and easier dispute processes."
            },
            {
                "question": "What's a red flag for a shopping scam?",
                "options": [
                    "Secure checkout",
                    "Prices significantly lower than everywhere else",
                    "Customer reviews",
                    "Clear return policy"
                ],
                "correct_index": 1,
                "explanation": "If a deal seems too good to be true, it probably is a scam."
            },
            {
                "question": "How can you verify an unfamiliar online store?",
                "options": [
                    "Trust their nice website design",
                    "Search for reviews and scam reports independently",
                    "Just try buying something cheap first",
                    "Check if they have a logo"
                ],
                "correct_index": 1,
                "explanation": "Independent research helps uncover scam reports and fake review patterns."
            }
        ]
    }
]

def get_lesson_by_id(lesson_id: str) -> dict:
    """Get a specific lesson by ID."""
    for lesson in LESSONS:
        if lesson["lesson_id"] == lesson_id:
            return lesson
    return None

def get_lesson_of_day() -> dict:
    """Get today's lesson based on date (Europe/Paris timezone)."""
    from datetime import datetime
    import pytz
    
    tz = pytz.timezone('Europe/Paris')
    today = datetime.now(tz)
    date_int = int(today.strftime('%Y%m%d'))
    index = date_int % len(LESSONS)
    return LESSONS[index]

def get_all_lessons() -> list:
    """Get all lessons (metadata only)."""
    return [
        {
            "lesson_id": lesson["lesson_id"],
            "title": lesson["title"],
            "topic": lesson["topic"]
        }
        for lesson in LESSONS
    ]
