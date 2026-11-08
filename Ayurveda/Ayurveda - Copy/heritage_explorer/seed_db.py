import os
from app import app
from models import db, Site

INITIAL_SITES = [
    {
        "level": 1,
        "name": "Konark Sun Temple",
        "location": "Puri, Odisha",
        "category": "Temple",
        "era": "13th Century CE (c. 1250 AD)",
        "puzzle_type": "jigsaw",
        "image_url": "/static/data/images/konark_sun.jpeg",
        "built_by": "King Narasimhadeva I (Eastern Ganga Dynasty)",
        "architecture_style": "Kalinga Nagara Architecture",
        "primary_deity": "Surya (The Sun God)",
        "materials_used": "Khondalite, Chlorite, and Iron beams",
        "history_overview": "Commissioned to celebrate military victories over northern invaders, Konark represents the pinnacle of Kalinga temple architecture. Over 1,200 artisans labored for 12 years to shape thousands of tons of stone into a celestial war chariot.",
        "engineering_marvel": "The entire temple is designed as a colossal 24-wheeled stone chariot pulled by seven galloping horses. Each 9.7-foot wheel is an exact sundial. By observing the shadow cast by the wheel spokes, ancient astronomers could calculate precise time down to the minute.",
        "sacred_legend": "Legend states that Samba, the son of Lord Krishna, was cured of a severe affliction after worshipping Surya at this exact spot for 12 years, prompting the construction of a sacred healing shrine.",
        "mystery_note": "Historians record that the primary idol once floated in mid-air inside the main sanctum (Garbhagriha), levitated by a massive 52-ton loadstone magnet installed in the tower crown."
    },
    {
        "level": 2,
        "name": "Brihadisvara Temple",
        "location": "Thanjavur, Tamil Nadu",
        "category": "Temple",
        "era": "11th Century CE (Completed 1010 AD)",
        "puzzle_type": "matching",
        "image_url": "/static/data/images/brihadrihaisvara.jpeg",
        "built_by": "Raja Raja Chola I",
        "architecture_style": "Classical Chola Dravidian Architecture",
        "primary_deity": "Lord Shiva (as Peruvudaiyar)",
        "materials_used": "Solid Granite (Over 130,000 tons)",
        "history_overview": "Built during the golden age of the Chola Empire, Brihadisvara was the largest architectural project in Asia at its time. It showcased the Cholas' naval prowess, wealth, and spiritual dedication, remaining an active center of worship for over a millennium.",
        "engineering_marvel": "The entire 216-foot tower (Vimana) was built without using any mortar, relying on precise interlocking puzzle-cut granite joints. The apex capstone (Kumbam) weighs 80 tons and was dragged up a 6-kilometer inclined earthen ramp using elephants.",
        "sacred_legend": "The inner sanctum houses one of India's largest monolithic Shiva Lingams, standing 29 feet high, carved from a single granite block representing the infinite pillar of light.",
        "mystery_note": "Despite being over 1,000 years old and located in a seismic zone, the tower has survived six major earthquakes without a single stone shifting from its position."
    },
    {
        "level": 3,
        "name": "Kailasa Temple (Ellora Cave 16)",
        "location": "Sambhaji Nagar, Maharashtra",
        "category": "Monument",
        "era": "8th Century CE (c. 756–773 AD)",
        "puzzle_type": "jigsaw",
        "image_url": "/static/data/images/kailasa.jpg",
        "built_by": "King Krishna I (Rashtrakuta Dynasty)",
        "architecture_style": "Monolithic Rock-Cut Dravidian Architecture",
        "primary_deity": "Lord Shiva",
        "materials_used": "Single Basaltic Volcanic Rock Cliff",
        "history_overview": "Kailasa is not built stone-by-stone; it was carved out of a mountain cliff face. It stands as the single largest monolithic structure on Earth, designed to physically replicate Mount Kailash, the abode of Shiva.",
        "engineering_marvel": "Sculptors excavated over 200,000 tons of solid basalt rock working strictly top-down using only simple chisels, hammers, and wooden wedges. They carved intricate three-story colonnades, life-sized elephant friezes, and bridges without making a single structural mistake.",
        "sacred_legend": "Legend says Queen Manikavati prayed to Lord Shiva when the King fell ill, pledging to fast until she saw the temple spire (Shikhara). Architect Kokasa solved the dilemma by carving top-down, completing the top spire in just seven days.",
        "mystery_note": "Modern engineers estimate that excavating this volume of basalt top-down with 8th-century tools would require continuous, non-stop manual work for nearly two centuries, yet inscriptions indicate it was completed in under 20 years."
    },
    {
        "level": 4,
        "name": "Sanchi Stupa",
        "location": "Raisen, Madhya Pradesh",
        "category": "Pilgrimage",
        "era": "3rd Century BCE to 1st Century CE",
        "puzzle_type": "wildcard",
        "image_url": "/static/data/images/kanchistupa.jpeg",
        "built_by": "Emperor Ashoka (Expanded by Shunga & Satavahana Kings)",
        "architecture_style": "Classical Buddhist Stupa & Torana Sculpture",
        "primary_deity": "Sacred Relics of Lord Buddha",
        "materials_used": "Sandstone, Brick, and Polished Stone",
        "history_overview": "Commissioned by Mauryan Emperor Ashoka after his conversion to Buddhism, Sanchi Stupa No. 1 is the oldest stone structure in India. It served as the central node for Buddhist monastic pilgrimage across ancient Asia.",
        "engineering_marvel": "The dome represents the vault of heaven enclosing sacred relics. Surrounding it are four carved stone gateways (Toranas) oriented precisely to the four cardinal compass directions, constructed using complex stone-tenon joints modeled after wooden carpentry.",
        "sacred_legend": "The intricate reliefs on the Torana gateways illustrate Jataka tales—stories of Buddha's previous incarnations—depicting him symbolically through lotus flowers, umbrellas, footprints, and vacant thrones rather than human likenesses.",
        "mystery_note": "Inscriptions reveal that the gateways were gifted not by kings, but crowds of ordinary citizens—ivory carvers, stonemasons, guilds, and pilgrims—making it one of the earliest crowdsourced monuments in history."
    },
    {
        "level": 5,
        "name": "Kedarnath Temple",
        "location": "Rudraprayag, Uttarakhand",
        "category": "Pilgrimage",
        "era": "8th Century CE (Rebuilt by Adi Shankaracharya)",
        "puzzle_type": "matching",
        "image_url": "/static/data/images/Kedarnath-Temple.jpg",
        "built_by": "Pandavas (Mythological) / Adi Shankaracharya (Historical)",
        "architecture_style": "Himalayan Katyuri Architecture",
        "primary_deity": "Lord Shiva (Sadashiva)",
        "materials_used": "Massive Grey Granite Slabs & Molten Lead Joints",
        "history_overview": "Perched at 3,583 meters above sea level amidst snow-capped Himalayan peaks, Kedarnath is one of the highest Jyotirlinga temples in India and a primary stop on the Himalayan Chota Char Dham pilgrimage circuit.",
        "engineering_marvel": "Constructed from massive, thick stone slabs bound together using interlocked groove joints without mortar. The foundation is engineered to withstand extreme sub-zero temperatures, heavy snow accumulation, and glacial pressure.",
        "sacred_legend": "According to the Mahabharata, the Pandavas sought Shiva to atone for sins committed during the Kurukshetra War. Shiva transformed into a bull to hide underground; when pursued, his hump emerged at Kedarnath.",
        "mystery_note": "During the catastrophic 2013 flash floods, a colossal natural boulder (now named Bhim Shila) rolled down the mountain and stopped meters behind the temple, splitting the raging water torrent into two paths and keeping the main structure intact."
    },
    {
        "level": 6,
        "name": "Meenakshi Amman Temple",
        "location": "Madurai, Tamil Nadu",
        "category": "Temple",
        "era": "14th–17th Century CE",
        "puzzle_type": "wildcard",
        "image_url": "/static/data/images/meenakshiamman.jpeg",
        "built_by": "Madurai Nayak Dynasty (King Tirumala Nayaka)",
        "architecture_style": "Dravidian Gopuram Architecture",
        "primary_deity": "Goddess Meenakshi (Parvati) & Sundareswarar (Shiva)",
        "materials_used": "Granite, Stucco, and Mineral Pigments",
        "history_overview": "Madurai was designed geometrically around this temple complex like a lotus flower with concentric street grids. Serving as the cultural heart of Tamil Nadu, the temple complex covers over 45 acres.",
        "engineering_marvel": "Houses 14 majestic Gopurams (monumental gateway towers), the highest soaring over 170 feet. The towers feature over 33,000 colorful stucco sculptures of mythological beings, restored every 12 years.",
        "sacred_legend": "Celebrates the celestial wedding of Goddess Meenakshi (born with warrior traits and three breasts, which vanished upon meeting Shiva) and Lord Sundareswarar during the annual Chithirai festival.",
        "mystery_note": "The 'Hall of 1000 Pillars' (Ayiram Kaal Mandapam) contains columns carved with such mathematical symmetry that looking from any single pillar down any diagonal aisle presents an unobstructed straight line."
    },
    {
        "level": 7,
        "name": "Mahabodhi Temple",
        "location": "Bodh Gaya, Bihar",
        "category": "Pilgrimage",
        "era": "5th–6th Century CE",
        "puzzle_type": "jigsaw",
        "image_url": "/static/data/images/mahabodhi-temple.jpeg",
        "built_by": "Gupta Empire Period Restoration",
        "architecture_style": "Classical Indian Brick & Stucco Architecture",
        "primary_deity": "Lord Buddha",
        "materials_used": "Baked Clay Bricks & Plaster",
        "history_overview": "Mahabodhi is the holiest pilgrimage site in Buddhism. It marks the precise physical spot where Prince Siddhartha Gautama sat under a sacred Pipal tree (Bodhi Tree) and attained supreme Enlightenment (Nirvana) in 528 BCE.",
        "engineering_marvel": "Stands as one of the oldest surviving high-rise brick structures in India. Its central grand spire (Shikhara) reaches 55 meters in height, featuring linear step-terraced brickwork overlaid with plaster reliefs.",
        "sacred_legend": "Positioned beside the main spire is the Vajrasana (The Diamond Throne), a carved stone slab installed by Emperor Ashoka to mark the exact spot where Buddha sat during his deep meditation.",
        "mystery_note": "The current Bodhi Tree growing beside the temple is a direct descendant of the original tree under which Buddha sat, preserved through saplings brought back from Sri Lanka in 288 BCE."
    },
    {
        "level": 8,
        "name": "Virupaksha Temple",
        "location": "Hampi, Karnataka",
        "category": "Temple",
        "era": "7th–14th Century CE",
        "puzzle_type": "matching",
        "image_url": "/static/data/images/virupaksha-temple.jpg",
        "built_by": "Vijayanagara Empire (Expanded by Lakkana Dandesha)",
        "architecture_style": "Vijayanagara Dravidian Architecture",
        "primary_deity": "Lord Virupaksha (Shiva)",
        "materials_used": "Granite & Brick Gopuram",
        "history_overview": "Located along the banks of the Tungabhadra River, Virupaksha is the main center of pilgrimage in Hampi. Remarkably, worship here has continued uninterrupted without stopping since the 7th century CE.",
        "engineering_marvel": "Features a 165-foot gateway tower (Raya Gopuram). Inside the inner sanctum wall, ancient builders engineered a natural pinhole camera effect: light passing through an entry slit casts an inverted shadow of the main tower onto the wall inside.",
        "sacred_legend": "Hampi is identified as Kishkindha, the monkey kingdom described in the Ramayana. The hills surrounding the temple are held to be where Lord Rama met Hanuman and Sugriva.",
        "mystery_note": "When the Vijayanagara capital was destroyed in 1565 AD, surrounding temples were ruined, but Virupaksha survived largely undamaged and remains an active place of daily worship today."
    },
    {
        "level": 9,
        "name": "Khajuraho Group of Monuments",
        "location": "Chhatarpur, Madhya Pradesh",
        "category": "Monument",
        "era": "950–1050 CE",
        "puzzle_type": "jigsaw",
        "image_url": "/static/data/images/Khajuraho.jpg",
        "built_by": "Chandela Dynasty Kings",
        "architecture_style": "Panchayatana Nagara Architecture",
        "primary_deity": "Lord Shiva (Kandariya Mahadeva Temple)",
        "materials_used": "Sandstone without Mortar",
        "history_overview": "Built over a 100-year period by the Chandela kings, Khajuraho originally comprised 85 temples spread across 20 square kilometers. Today, 25 surviving structures stand as UNESCO World Heritage sites celebrating life, art, and philosophy.",
        "engineering_marvel": "Built atop elevated stone platforms (Jagati). Architects used precise mortise-and-tenon interlocking joints to fit massive sandstone blocks together without mortar, relying entirely on gravity and precise balancing.",
        "sacred_legend": "The layout represents the Hindu cosmological concept of Mount Meru. The central spire of Kandariya Mahadeva features 84 miniature replica towers (Urushringas) clustered around the main tower to simulate a mountain range.",
        "mystery_note": "While widely famous for erotic relief carvings, these figures make up less than 10% of the wall art. The remaining 90% depicts daily medieval life—musicians, scholars, warriors, dancers, and spiritual seekers."
    },
    {
        "level": 10,
        "name": "Golden Temple (Harmandir Sahib)",
        "location": "Amritsar, Punjab",
        "category": "Pilgrimage",
        "era": "16th Century CE (Founded 1581 AD)",
        "puzzle_type": "wildcard",
        "image_url": "/static/data/images/golden.jpeg",
        "built_by": "Guru Arjan Dev Ji (5th Sikh Guru)",
        "architecture_style": "Sikh Architecture (Blend of Indo-Islamic & Rajput styles)",
        "primary_deity": "Guru Granth Sahib Ji",
        "materials_used": "White Marble, Copper, and 24-Karat Gold Leaf",
        "history_overview": "Harmandir Sahib is the central spiritual shrine of Sikhism. Built in the middle of a holy water tank, it emphasizes humility, equality, and service to all humanity regardless of background.",
        "engineering_marvel": "Unlike traditional Indian temples built on elevated ground, the Golden Temple is constructed on a lower level than its surrounding courtyard. Visitors walk down steps to enter, symbolizing spiritual humility.",
        "sacred_legend": "The temple is surrounded by a large man-made lake called the Amrit Sarovar ('Pool of Nectar'), excavated by Guru Ram Das Ji. Legend holds that its waters possess deep spiritual healing properties.",
        "mystery_note": "The complex operates the world's largest free community kitchen (Langar), serving hot vegetarian meals to over 100,000 pilgrims every single day, run entirely by volunteers."
    }
]

def seed_database():
    with app.app_context():
        # Recreate database tables clean
        db.drop_all()
        db.create_all()
        
        # Bulk insert all 10 heritage sites
        for site_data in INITIAL_SITES:
            site = Site(**site_data)
            db.session.add(site)
            
        db.session.commit()
        
        target_db = app.config.get('SQLALCHEMY_DATABASE_URI', 'database')
        print(f"Successfully re-initialized and seeded 10 levels into target database: {target_db}")

if __name__ == "__main__":
          seed_database()