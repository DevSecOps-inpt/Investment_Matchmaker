#!/usr/bin/env python3
"""
Demo script to populate the Investment Matchmaker platform with sample startup data.
Run this after starting the backend to see some example startups.
"""

import requests
import json
import time

# Sample startup data
SAMPLE_STARTUPS = [
    {
        "title": "EcoCharge - Wireless EV Charging",
        "description": "Revolutionary wireless charging technology for electric vehicles. Our system allows EVs to charge while driving over specially equipped roads, eliminating range anxiety and charging stops. We're seeking funding to scale our pilot program in California.",
        "owner": "Dr. Sarah Chen",
        "category": "Technology",
        "funding_needed": 2500000
    },
    {
        "title": "HealthAI - Personalized Medicine Platform",
        "description": "AI-powered platform that analyzes genetic data to provide personalized treatment recommendations. Our system has shown 40% better outcomes compared to standard protocols. Looking for Series A funding to expand to 50 hospitals.",
        "owner": "Dr. Michael Rodriguez",
        "category": "Healthcare",
        "funding_needed": 5000000
    },
    {
        "title": "EduTech Pro - VR Learning Solutions",
        "description": "Virtual reality educational platform that transforms how students learn complex subjects. Our VR simulations for science and engineering have increased student engagement by 300%. Seeking funding for content development and market expansion.",
        "owner": "Jennifer Park",
        "category": "Education",
        "funding_needed": 1200000
    },
    {
        "title": "GreenFarm - Vertical Farming Automation",
        "description": "Automated vertical farming systems that produce 10x more food per square foot than traditional farming. Our IoT-enabled greenhouses use 90% less water and can operate year-round. Seeking funding to build our first commercial facility.",
        "owner": "Alex Thompson",
        "category": "Technology",
        "funding_needed": 1800000
    },
    {
        "title": "FinFlow - Small Business Banking",
        "description": "Digital banking platform specifically designed for small businesses and freelancers. We offer instant loans, automated accounting, and financial insights. Our platform has helped 500+ businesses access $2M in funding. Seeking Series B for expansion.",
        "owner": "Maria Santos",
        "category": "Finance",
        "funding_needed": 3000000
    }
]

def populate_startups():
    """Add sample startups to the platform"""
    print("🚀 Populating Investment Matchmaker with sample startups...")
    print("=" * 60)
    
    base_url = "http://localhost:8000"
    
    # Check if backend is running
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code != 200:
            print("❌ Backend is not responding. Make sure it's running on port 8000.")
            return
        print("✅ Backend is running and responding")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Make sure it's running on port 8000.")
        return
    
    # Add each startup
    for i, startup_data in enumerate(SAMPLE_STARTUPS, 1):
        try:
            response = requests.post(
                f"{base_url}/startups",
                json=startup_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                startup = response.json()
                print(f"✅ Added: {startup['title']}")
                print(f"   Category: {startup['category']}")
                print(f"   Funding: ${startup['funding_needed']:,}" if startup['funding_needed'] else "   Funding: Not specified")
                print(f"   Founder: {startup['owner']}")
                print()
            else:
                print(f"❌ Failed to add startup {i}: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error adding startup {i}: {e}")
        
        # Small delay between requests
        time.sleep(0.5)
    
    print("=" * 60)
    print("🎉 Sample startups added successfully!")
    print("🌐 Visit http://localhost:3000 to see your startup platform in action")
    print("\n💡 Try these features:")
    print("   • Browse the startup listings")
    print("   • Click on a startup to see details")
    print("   • Start a chat with a founder")
    print("   • Post your own startup idea")

if __name__ == "__main__":
    populate_startups()
