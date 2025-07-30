"use client"
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import '../styles/globals.css'; // Ensure the styles are available
import Link from 'next/link';

const Home = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [hoveredLink, setHoveredLink] = useState(null);
    const [hoveredMember, setHoveredMember] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('en');

    const translations = {
        en: {
            logo: "Agrichain",
            home: "Home",
            vision_title: "Our Vision",
            vision_content: "Empower Indian Farmers. Our blockchain-based supply chain platform is designed to provide Indian farmers with transparent and secure access to vital agricultural information. We aim to enhance their productivity and sustainability, ensuring a positive impact on their livelihoods.",
            about_title: "About Us",
            about_content: "Our Mission: We strive to empower Indian farmers with blockchain technology, enabling informed decision-making that enhances food security. Agrichain is dedicated to raising awareness about the significance of digital transformation in agriculture, creating pathways to better farming practices.",
            welcome: "Welcome to Agrichain",
            empowerment: "Empowering Indian Farmers through Blockchain Technology",
            team: "Meet the Team",
            login: "Login",
            team_members: ["Himanshu Pandey", "Uday Naik", "Kulsum Khan"],
        },
        hi: {
            logo: "एग्रीचेन",
            home: "मुख्यपृष्ठ",
            vision_title: "हमारा दृष्टिकोण",
            vision_content: "भारतीय किसानों को सशक्त बनाना। हमारा ब्लॉकचेन-आधारित आपूर्ति श्रृंखला प्लेटफॉर्म भारतीय किसानों को महत्वपूर्ण कृषि जानकारी तक पारदर्शी और सुरक्षित पहुंच प्रदान करने के लिए डिज़ाइन किया गया है। हम उनकी उत्पादकता और स्थिरता को बढ़ाने का लक्ष्य रखते हैं, जिससे उनके जीवन पर सकारात्मक प्रभाव पड़े।",
            about_title: "हमारे बारे में",
            about_content: "हमारा मिशन: हम भारतीय किसानों को ब्लॉकचेन प्रौद्योगिकी के साथ सशक्त बनाने का प्रयास करते हैं, जो खाद्य सुरक्षा को बढ़ाने के लिए सूचित निर्णय लेने में सक्षम बनाता है। एग्रीचेन कृषि में डिजिटल परिवर्तन के महत्व के बारे में जागरूकता बढ़ाने के लिए समर्पित है, बेहतर कृषि प्रथाओं के लिए रास्ते बनाते हुए।",
            welcome: "एग्रीचेन में आपका स्वागत है",
            empowerment: "ब्लॉकचेन प्रौद्योगिकी के माध्यम से भारतीय किसानों को सशक्त बनाना",
            team: "टीम से मिलें",
            login: "लॉगिन",
            team_members: ["हिमांशु पांडे", "उदय नाइक", "कुलसुम खान"],
        },
        mr: {
            logo: "एग्रीचेन",
            home: "मुख्यपृष्ठ",
            vision_title: "आमचा दृष्टिकोन",
            vision_content: "भारतीय शेतकऱ्यांना सामर्थ्य प्रदान करणे. आमचा ब्लॉकचेन-आधारित पुरवठा साखळी प्लॅटफॉर्म भारतीय शेतकऱ्यांना महत्वाच्या कृषी माहितीसाठी पारदर्शक आणि सुरक्षित प्रवेश प्रदान करण्यासाठी डिझाइन केलेला आहे. आम्ही त्यांच्या उत्पादकता आणि शाश्वतता वाढवण्याचे लक्ष्य ठेवतो, त्यांच्या उपजीविकेवर सकारात्मक प्रभाव सुनिश्चित करतो.",
            about_title: "आमच्याबद्दल",
            about_content: "आमचे मिशन: आम्ही भारतीय शेतकऱ्यांना ब्लॉकचेन तंत्रज्ञानासह सामर्थ्य प्रदान करण्यासाठी प्रयत्नशील आहोत, जे खाद्य सुरक्षा वाढवण्यासाठी माहितीपूर्ण निर्णय घेण्यास सक्षम करते. एग्रीचेन कृषीमध्ये डिजिटल परिवर्तनाच्या महत्त्वाबद्दल जागरूकता वाढविण्यासाठी समर्पित आहे, उत्तम शेती पद्धतींसाठी मार्ग तयार करणे.",
            welcome: "एग्रीचेनमध्ये आपले स्वागत आहे",
            empowerment: "ब्लॉकचेन तंत्रज्ञानाद्वारे भारतीय शेतकऱ्यांना सामर्थ्य प्रदान करणे",
            team: "टीमबद्दल जाणून घ्या",
            login: "लॉगिन",
            team_members: ["हिमांशु पांडे", "उदय नाइक", "कुलसुम खान"],
        }
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleLinkMouseEnter = (link) => {
        setHoveredLink(link);
    };

    const handleLinkMouseLeave = () => {
        setHoveredLink(null);
    };

    const handleMemberMouseEnter = (member) => {
        setHoveredMember(member);
    };

    const handleMemberMouseLeave = () => {
        setHoveredMember(null);
    };

    const handleLanguageChange = (event) => {
        setSelectedLanguage(event.target.value);
    };

    return (
        <div>
            <Head>
                <title>{translations[selectedLanguage].logo}</title>
                <link rel="stylesheet" href="/App.css" />
            </Head>
            <header>
                <div id="logo">{translations[selectedLanguage].logo}</div>
                <nav>
                    <ul>
                        <li>
                            <a 
                                href="#home" 
                                onMouseEnter={() => handleLinkMouseEnter('home')} 
                                onMouseLeave={handleLinkMouseLeave}
                                style={{ 
                                    backgroundColor: hoveredLink === 'home' ? '#45a049' : 'transparent', 
                                    color: '#fff' 
                                }}
                            >
                                {translations[selectedLanguage].home}
                            </a>
                        </li>
                        <li>
                            <a 
                                href="#vision" 
                                onMouseEnter={() => handleLinkMouseEnter('vision')} 
                                onMouseLeave={handleLinkMouseLeave}
                                style={{ 
                                    backgroundColor: hoveredLink === 'vision' ? '#45a049' : 'transparent', 
                                    color: '#fff' 
                                }}
                            >
                                {translations[selectedLanguage].vision_title}
                            </a>
                        </li>
                        <li>
                            <a 
                                href="#about" 
                                onMouseEnter={() => handleLinkMouseEnter('about')} 
                                onMouseLeave={handleLinkMouseLeave}
                                style={{ 
                                    backgroundColor: hoveredLink === 'about' ? '#45a049' : 'transparent', 
                                    color: '#fff' 
                                }}
                            >
                                {translations[selectedLanguage].about_title}
                            </a>
                        </li>
                        <li className="dropdown">
                            <a
                                href="#login" 
                                className="dropbtn" 
                                onClick={toggleDropdown} 
                                onMouseEnter={() => handleLinkMouseEnter('login')} 
                                onMouseLeave={handleLinkMouseLeave}
                                style={{ 
                                    backgroundColor: hoveredLink === 'login' ? '#45a049' : 'transparent', 
                                    color: '#fff' 
                                }}
                            >
                                {translations[selectedLanguage].login}
                            </a>
                            {isDropdownOpen && (
                                <motion.div 
                                    className="dropdown-content"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {['farmer', 'manufacturer', 'inspector', 'customer'].map((role) => (
                                        <a 
                                            key={role}
                                            href={`#${role}`} 
                                            onMouseEnter={() => handleLinkMouseEnter(role)} 
                                            onMouseLeave={handleLinkMouseLeave}
                                            style={{ 
                                                backgroundColor: hoveredLink === role ? '#ddd' : 'transparent', 
                                                color: '#000' 
                                            }}
                                        >
                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                        </a>
                                    ))}
                                </motion.div>
                            )}
                        </li>
                        <li>
                            <a 
                                href="#team" 
                                onMouseEnter={() => handleLinkMouseEnter('team')} 
                                onMouseLeave={handleLinkMouseLeave}
                                style={{ 
                                    backgroundColor: hoveredLink === 'team' ? '#45a049' : 'transparent', 
                                    color: '#fff' 
                                }}
                            >
                                {translations[selectedLanguage].team}
                            </a>
                        </li>
                    </ul>
                </nav>
                <select onChange={handleLanguageChange} value={selectedLanguage}>
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="mr">Marathi</option>
                </select>
            </header>
            <main>
                <section id="home">
                    <h1>{translations[selectedLanguage].welcome}</h1>
                    <h3>{translations[selectedLanguage].empowerment}</h3>
                </section>
                <section id="vision">
                    <h1>{translations[selectedLanguage].vision_title}</h1>
                    <div className="vision-block">
                        <p>{translations[selectedLanguage].vision_content}</p>
                    </div>
                </section>
                <section id="about">
                    <h1>{translations[selectedLanguage].about_title}</h1>
                    <div className="about-block">
                        <p>{translations[selectedLanguage].about_content}</p>
                    </div>
                </section>
                <section id="team">
                    <h1>{translations[selectedLanguage].team}</h1>
                    <div className="team-member-container">
                        {translations[selectedLanguage].team_members.map((member, index) => (
                            <div 
                                key={index} 
                                className="team-member"
                                onMouseEnter={() => handleMemberMouseEnter(member)} 
                                onMouseLeave={handleMemberMouseLeave}
                                style={{ 
                                    backgroundColor: hoveredMember === member ? '#f0f0f0' : 'transparent' 
                                }}
                            >
                                <p>{member}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <footer>
                <p>© 2024 Agrichain. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default Home;
