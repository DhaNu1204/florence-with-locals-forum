-- ============================================================
-- 005_seed_content.sql
-- Seed realistic forum content for Florence With Locals Forum
-- All posts attributed to admin user (dhanu) as the sole user
-- Triggers auto-handle: reply_count, thread_count, post_count,
-- last_reply_at, last_reply_by, search_vector
-- ============================================================

DO $$
DECLARE
  v_user_id UUID := 'd93ba2a2-0c46-4d03-8665-afb3a4659887';
  v_thread_id UUID;
BEGIN

  -- Guard: skip if seed data already exists
  IF EXISTS (SELECT 1 FROM threads LIMIT 1) THEN
    RAISE NOTICE 'Seed threads already exist — skipping 005_seed_content';
    RETURN;
  END IF;

  -- ============================================================
  -- 1. Trip Reports & Photos — "Our 5-Day Florence Itinerary"
  -- ============================================================
  INSERT INTO threads (category_id, author_id, title, slug, content, view_count, like_count, created_at, updated_at)
  VALUES (
    (SELECT id FROM categories WHERE slug = 'trip-reports'),
    v_user_id,
    'Our 5-Day Florence Itinerary - What Worked and What Didn''t',
    'our-5-day-florence-itinerary-what-worked',
    '<p>Just got back from 5 days in Florence with my family (2 adults, 2 kids aged 10 and 13) and wanted to share what we learned the hard way so you don''t have to!</p>

<p><strong>Day 1 — Settling In &amp; Oltrarno</strong></p>
<p>We arrived mid-morning and walked from our apartment near Santa Croce to Oltrarno. This was the perfect low-key start. We wandered through artisan workshops on Via Maggio, grabbed paninis at a little place near Piazza Santo Spirito, and got gelato at a shop the apartment owner recommended. No museums, no pressure — just getting our bearings.</p>

<p><strong>Day 2 — The Uffizi</strong></p>
<p>Book your tickets at least 2 weeks in advance. We did the 8:30am slot and it was <em>so worth it</em>. By 10:30 it was packed. We focused on the Botticelli rooms, Caravaggio, and the Raphael. Skipped the gift shop line entirely. The kids lasted about 2 hours which was perfect.</p>

<p><strong>Day 3 — Accademia &amp; San Lorenzo</strong></p>
<p>Saw David in the morning (again, early booking). The kids were actually impressed — it''s much bigger than you expect. Then we explored the San Lorenzo leather market. Tip: don''t buy from the first stall. Walk deeper into the market for better prices and quality.</p>

<p><strong>Day 4 — Ponte Vecchio, Boboli &amp; Piazzale Michelangelo</strong></p>
<p>Walked across Ponte Vecchio early (before 9am it''s almost empty). Spent the morning in Boboli Gardens — bring water and snacks, there''s not much inside. In the evening, we took a taxi to Piazzale Michelangelo for sunset. <strong>This was the highlight of the entire trip.</strong> The view is absolutely unreal.</p>

<p><strong>Day 5 — Duomo &amp; Departure</strong></p>
<p>Climbed the Duomo dome (463 steps!). The 13-year-old loved it, the 10-year-old was less thrilled. Reserve your time slot online. We had a long lunch near the Mercato Centrale as our farewell meal.</p>

<p><strong>What I''d Do Differently:</strong></p>
<ul>
<li>Book restaurant reservations for dinner — we got turned away twice</li>
<li>Buy a refillable water bottle (there are free water fountains everywhere)</li>
<li>Don''t try to see everything — pick 2-3 things per day max</li>
<li>Comfortable shoes are non-negotiable — the cobblestones are brutal</li>
</ul>

<p>Happy to answer any questions about our trip!</p>',
    182,
    12,
    NOW() - INTERVAL '28 days',
    NOW() - INTERVAL '28 days'
  ) RETURNING id INTO v_thread_id;

  INSERT INTO posts (thread_id, author_id, content, created_at, updated_at)
  VALUES (
    v_thread_id, v_user_id,
    '<p>Thanks for sharing this! Really helpful breakdown. Quick question — how did you handle the heat? We''re going in July and I''m worried about the kids wilting in the afternoon sun.</p>',
    NOW() - INTERVAL '26 days',
    NOW() - INTERVAL '26 days'
  );

  INSERT INTO posts (thread_id, author_id, content, created_at, updated_at)
  VALUES (
    v_thread_id, v_user_id,
    '<p>We did a very similar trip last October! Totally agree about booking Uffizi tickets early — we almost missed out. One thing I''d add: the Palazzo Vecchio has a great "Secret Passages" tour that''s perfect for kids. My daughter loved the hidden staircases!</p>',
    NOW() - INTERVAL '25 days',
    NOW() - INTERVAL '25 days'
  );

  -- ============================================================
  -- 2. Trip Reports & Photos — "First Time in Florence"
  -- ============================================================
  INSERT INTO threads (category_id, author_id, title, slug, content, view_count, like_count, created_at, updated_at)
  VALUES (
    (SELECT id FROM categories WHERE slug = 'trip-reports'),
    v_user_id,
    'First Time in Florence - Exceeded All Expectations',
    'first-time-in-florence-exceeded-expectations',
    '<p>I just spent 4 days in Florence as a solo traveler and I genuinely don''t have the words. This city changed something in me.</p>

<p>I had a rough plan but ended up throwing most of it away after day one. The best moments were the unplanned ones — getting completely lost in the winding streets of <strong>Oltrarno</strong>, stumbling into a tiny workshop where a man was hand-gilding picture frames using techniques from the 1400s, sitting on the steps of Santo Spirito with a glass of wine watching the world go by.</p>

<p>A few highlights:</p>
<ul>
<li><strong>Gelato near Santa Croce:</strong> I tried Vivoli (the famous one) and honestly? It was good but not the best I had. A tiny unnamed shop on a side street near Via dei Benci was better. Sometimes the best things in Florence don''t have a name on TripAdvisor.</li>
<li><strong>Aperitivo culture:</strong> I had no idea this was a thing. For the price of a cocktail (€8-12) you get access to a whole buffet of food at many bars between 6-8pm. My favorite was a rooftop place near Piazza della Repubblica.</li>
<li><strong>The light:</strong> The golden hour light in Florence is like nothing else. The way it hits the Arno and the terracotta rooftops around 6pm in autumn... I took about 400 photos.</li>
</ul>

<p>If you''re considering going solo — do it. Florence is safe, walkable, and incredibly welcoming. I ate alone at restaurants every night and never felt awkward. The Florentines are genuinely warm once you make the effort to speak even a little Italian.</p>

<p><em>Grazie mille, Firenze. I''ll be back.</em></p>',
    153,
    14,
    NOW() - INTERVAL '25 days',
    NOW() - INTERVAL '25 days'
  ) RETURNING id INTO v_thread_id;

  INSERT INTO posts (thread_id, author_id, content, created_at, updated_at)
  VALUES (
    v_thread_id, v_user_id,
    '<p>Oltrarno really is the <em>real</em> Florence! So glad you discovered it. Did you make it to the Boboli Gardens while you were on that side of the river? The view from the top looking back at the Duomo is breathtaking. Also, that aperitivo culture is one of the best-kept secrets for budget travelers!</p>',
    NOW() - INTERVAL '23 days',
    NOW() - INTERVAL '23 days'
  );

  -- ============================================================
  -- 3. Planning Your Florence Visit — "Best Time to Visit"
  -- ============================================================
  INSERT INTO threads (category_id, author_id, title, slug, content, view_count, like_count, created_at, updated_at)
  VALUES (
    (SELECT id FROM categories WHERE slug = 'planning'),
    v_user_id,
    'Best Time to Visit Florence? Spring vs Fall',
    'best-time-to-visit-florence-spring-vs-fall',
    '<p>I''ve been lucky enough to visit Florence in both April and October, and people always ask me which is better. Here''s my honest comparison:</p>

<p><strong>Spring (April)</strong></p>
<ul>
<li>Flowers everywhere — the wisteria on old buildings is magical</li>
<li>Temperatures around 15-22°C (60-72°F) — perfect walking weather</li>
<li>Easter celebrations if your timing is right</li>
<li>Crowds are building but not yet peak</li>
<li>Some rain (pack a light jacket)</li>
<li>Hotel prices starting to climb but still reasonable</li>
</ul>

<p><strong>Fall (October)</strong></p>
<ul>
<li>The light is golden and incredible for photos</li>
<li>Grape harvest and wine festivals in surrounding Tuscany</li>
<li>Temperatures around 14-20°C (57-68°F)</li>
<li>Summer crowds have thinned significantly</li>
<li>Truffle season begins — the food is next level</li>
<li>Hotel prices dropping from peak</li>
</ul>

<p><strong>My verdict:</strong> October wins by a hair. The combination of fewer crowds, harvest season food, and that incredible autumn light makes it special. But honestly, you can''t go wrong with either.</p>

<p>The months I''d <em>avoid</em>: July and August. Temperatures hit 38°C+, the crowds are overwhelming, and many local restaurants close for their own holidays. If summer is your only option, go in June or early September.</p>',
    198,
    11,
    NOW() - INTERVAL '27 days',
    NOW() - INTERVAL '27 days'
  ) RETURNING id INTO v_thread_id;

  INSERT INTO posts (thread_id, author_id, content, created_at, updated_at)
  VALUES (
    v_thread_id, v_user_id,
    '<p>October is absolutely magical. I was there during the grape harvest last year and got invited to a vineyard crush near Greve in Chianti. The light in the late afternoon is this warm amber color that makes everything look like a Renaissance painting. Highly recommend!</p>',
    NOW() - INTERVAL '25 days',
    NOW() - INTERVAL '25 days'
  );

  INSERT INTO posts (thread_id, author_id, content, created_at, updated_at)
  VALUES (
    v_thread_id, v_user_id,
    '<p>Counterpoint: we went in March and it rained for 3 out of 5 days. Still absolutely loved it though! The museums were empty, restaurants had tables available, and there''s something romantic about Florence in the rain. Plus the prices were the lowest we''ve ever seen for hotels near the center. Every season has its charm!</p>',
    NOW() - INTERVAL '24 days',
    NOW() - INTERVAL '24 days'
  );

  -- ============================================================
  -- 4. Planning Your Florence Visit — "Florence with Kids"
  -- ============================================================
  INSERT INTO threads (category_id, author_id, title, slug, content, view_count, like_count, created_at, updated_at)
  VALUES (
    (SELECT id FROM categories WHERE slug = 'planning'),
    v_user_id,
    'Florence with Kids - Is It Worth It?',
    'florence-with-kids-is-it-worth-it',
    '<p>Short answer: <strong>absolutely yes.</strong></p>

<p>I see this question come up a lot and I understand the worry. Florence seems like it''s all Renaissance art and wine — not exactly kid territory. But we''ve taken our kids (now 8 and 11) three times and they ask to go back every year.</p>

<p>Here''s what works:</p>

<p><strong>The Gelato Strategy</strong> — This is your secret weapon. Promise gelato after every museum and suddenly art becomes a lot more interesting. There are gelaterias on literally every corner.</p>

<p><strong>Palazzo Vecchio Secret Passages Tour</strong> — Book this! It takes you through hidden rooms, secret staircases, and behind paintings. My kids thought they were Indiana Jones. It runs about 75 minutes and is available in English.</p>

<p><strong>Boboli Gardens</strong> — Let them run. After being told "don''t touch" in museums, kids need space to move. Boboli has fountains, grottos, and hills to explore. Pack a picnic.</p>

<p><strong>Leather Workshop Visit</strong> — Some shops in Santa Croce area let kids try stamping leather. It''s free and they get to keep what they make.</p>

<p><strong>Piazza della Repubblica Carousel</strong> — Yes, there''s an antique carousel right in the center of Florence. €2 a ride. Life saver when you need 10 minutes to check your map in peace.</p>

<p><strong>Tips:</strong></p>
<ul>
<li>Keep museum visits to 1 per day, max 90 minutes</li>
<li>Apartment rental &gt; hotel (you can make breakfast and have space)</li>
<li>Italian kids eat dinner at 8-9pm so restaurants are very kid-friendly</li>
<li>The Mercato Centrale food hall has something for every picky eater</li>
</ul>

<p>Florence taught my kids that history isn''t just something in books. That alone makes it worth it.</p>',
    124,
    9,
    NOW() - INTERVAL '22 days',
    NOW() - INTERVAL '22 days'
  ) RETURNING id INTO v_thread_id;

  INSERT INTO posts (thread_id, author_id, content, created_at, updated_at)
  VALUES (
    v_thread_id, v_user_id,
    '<p>Absolutely worth it! Our kids <em>still</em> talk about the leather market — my son bargained for his first wallet and was so proud of himself. One more tip: the Leonardo da Vinci Museum (Museo Leonardo) near the Duomo has interactive models of his inventions that kids can actually touch and operate. It''s small but my kids spent over an hour there.</p>',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '20 days'
  );

  -- ============================================================
  -- 5. Food & Wine — "The Ultimate Florence Food Guide"
  -- ============================================================
  INSERT INTO threads (category_id, author_id, title, slug, content, view_count, like_count, created_at, updated_at)
  VALUES (
    (SELECT id FROM categories WHERE slug = 'food-wine'),
    v_user_id,
    'The Ultimate Florence Food Guide - Where Locals Actually Eat',
    'ultimate-florence-food-guide-where-locals-eat',
    '<p>After 6 visits to Florence (and gaining approximately 15 kilos in the process), here are my genuinely tried-and-tested recommendations. No tourist traps, no sponsored content — just honest favorites.</p>

<p><strong>Understanding the Difference:</strong> A <em>trattoria</em> is casual and family-run, a <em>ristorante</em> is more formal, and an <em>osteria</em> was traditionally a wine bar with food. In Florence, the best meals are almost always at trattorias.</p>

<p><strong>My Favorites:</strong></p>

<p><strong>1. Trattoria Mario</strong> (near San Lorenzo Market)<br>
Communal tables, no reservations, cash only. The ribollita and bistecca are legendary. Get there by 11:45 or face a 30+ minute wait. €12-18 per person for a full meal.</p>

<p><strong>2. Il Latini</strong> (near Santa Maria Novella)<br>
Huge portions of traditional Tuscan food. The prosciutto hanging from the ceiling tells you everything. Try the fagioli all''uccelletto (beans in tomato sauce). Book ahead.</p>

<p><strong>3. Buca Mario</strong> (underground, near Piazza Goldoni)<br>
One of the oldest restaurants in Florence (since 1886). Go for the bistecca alla fiorentina. It''s a splurge but worth it for a special night.</p>

<p><strong>4. Trattoria Sostanza</strong> (near the Arno)<br>
Tiny, chaotic, perfection. The <em>burro di carciofi</em> (artichoke butter) is life-changing. Also cash only.</p>

<p><strong>5. All''Antico Vinaio</strong> (near Uffizi)<br>
The best sandwiches in Florence, arguably in Italy. €5-7 for an enormous schiacciata filled with porchetta, truffle cream, artichoke paste — whatever combination you dream up. The queue is long but moves fast.</p>

<p><strong>For Aperitivo:</strong></p>
<ul>
<li><strong>Le Volpi e l''Uva</strong> — wine bar near Ponte Vecchio, incredible cheese boards</li>
<li><strong>Amblé</strong> — tiny courtyard bar, perfect for a pre-dinner Negroni (which was invented in Florence!)</li>
</ul>

<p><strong>For Gelato:</strong></p>
<ul>
<li><strong>La Sorbettiera</strong> — slightly off the tourist path, worth the walk</li>
<li><strong>My Sugar</strong> — near Santa Croce, try the pistachio</li>
<li>Rule of thumb: if it''s piled high in mountains of bright colors, walk away. Real gelato is stored flat in covered containers.</li>
</ul>

<p><strong>Pro Tips:</strong></p>
<ul>
<li>Lunch is the better value meal — many places offer a <em>pranzo</em> (lunch) special</li>
<li>Cover charge (<em>coperto</em>) of €2-3 per person is normal and legal</li>
<li>You don''t tip in Italy like in the US — rounding up or leaving €1-2 is generous</li>
<li>Drink coffee at the bar standing up — it''s cheaper and more authentic</li>
</ul>',
    214,
    15,
    NOW() - INTERVAL '26 days',
    NOW() - INTERVAL '26 days'
  ) RETURNING id INTO v_thread_id;

  INSERT INTO posts (thread_id, author_id, content, created_at, updated_at)
  VALUES (
    v_thread_id, v_user_id,
    '<p>Can confirm Trattoria Mario is amazing — the ribollita there is the best I''ve had anywhere. We got there at 11:50 and barely squeezed in. By noon the queue was down the street. Totally worth the early lunch!</p>',
    NOW() - INTERVAL '24 days',
    NOW() - INTERVAL '24 days'
  );

  INSERT INTO posts (thread_id, author_id, content, created_at, updated_at)
  VALUES (
    v_thread_id, v_user_id,
    '<p>Great list but you absolutely CANNOT leave out <strong>lampredotto</strong> from the street carts! It''s tripe in a sandwich and I know that sounds terrible but it''s one of the most iconic Florentine street foods. The cart near the Mercato Nuovo (the one with the bronze boar statue) has been there for decades. €4 for a sandwich that locals queue up for. Be brave and try it!</p>',
    NOW() - INTERVAL '23 days',
    NOW() - INTERVAL '23 days'
  );

  -- ============================================================
  -- 6. Food & Wine — "Chianti Wine Tasting Day Trip"
  -- ============================================================
  INSERT INTO threads (category_id, author_id, title, slug, content, view_count, like_count, created_at, updated_at)
  VALUES (
    (SELECT id FROM categories WHERE slug = 'food-wine'),
    v_user_id,
    'Chianti Wine Tasting Day Trip - Our Experience',
    'chianti-wine-tasting-day-trip-experience',
    '<p>We just did a day trip to the Chianti wine region and it was one of the best days of our entire Italy trip. Here''s everything you need to know.</p>

<p><strong>The Route We Took:</strong></p>
<p>Florence → Greve in Chianti → Castellina in Chianti → a small family winery near Radda → back to Florence. Total driving time was about 2.5 hours spread across the day, but we stopped constantly because the views were too beautiful to ignore.</p>

<p><strong>The Wineries:</strong></p>
<p>We visited three wineries, which felt like the right amount — enough variety without becoming a blur.</p>

<ol>
<li><strong>A large estate near Greve</strong> — Beautiful property, professional tour, good introduction to Chianti Classico. €15 per person for tour + 4-wine tasting with snacks.</li>
<li><strong>A medium family vineyard near Castellina</strong> — This was our favorite. The owner himself walked us through the cellar and told stories about his grandfather planting the first vines. We bought 3 bottles. €20 for a private tasting with cheese and salami.</li>
<li><strong>A small organic winery near Radda</strong> — Very casual, met the winemaker''s dog, sat in a garden overlooking the valley. €12 per person, and we were the only visitors. Magical.</li>
</ol>

<p><strong>Practical Tips:</strong></p>
<ul>
<li><strong>Book tastings in advance</strong> — most wineries require reservations, even small ones</li>
<li><strong>Designate a driver or book a tour</strong> — the roads are narrow and winding, and Italian drink-driving laws are strict (0.05% limit)</li>
<li><strong>Bring cash</strong> — smaller wineries may not take cards</li>
<li><strong>Leave Florence by 9am</strong> — wineries usually do tastings 10am-12pm and 2-5pm</li>
<li><strong>Stop in Greve in Chianti for lunch</strong> — the central piazza has several excellent trattorias</li>
</ul>

<p>The Chianti landscape in autumn is honestly one of the most beautiful things I''ve ever seen. Rolling hills, cypress trees, medieval villages perched on hilltops, vineyards turning gold. Bring a good camera.</p>',
    97,
    7,
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '20 days'
  ) RETURNING id INTO v_thread_id;

  INSERT INTO posts (thread_id, author_id, content, created_at, updated_at)
  VALUES (
    v_thread_id, v_user_id,
    '<p>This sounds wonderful! Did you do self-drive or a guided tour? We''re debating this for our trip in March. I like the flexibility of driving ourselves but my partner is nervous about the narrow roads and the ZTL zones. Also, did any of the wineries ship bottles internationally? We''d love to bring some home but our luggage is already packed!</p>',
    NOW() - INTERVAL '18 days',
    NOW() - INTERVAL '18 days'
  );

  -- ============================================================
  -- 7. Art, History & Culture — "Tips for the Uffizi"
  -- ============================================================
  INSERT INTO threads (category_id, author_id, title, slug, content, view_count, like_count, created_at, updated_at)
  VALUES (
    (SELECT id FROM categories WHERE slug = 'art-history-culture'),
    v_user_id,
    'Tips for Visiting the Uffizi Without the Overwhelm',
    'tips-for-visiting-uffizi-without-overwhelm',
    '<p>The Uffizi has over 100 rooms and thousands of works. Trying to see everything is a guaranteed recipe for exhaustion and glazed eyes. Here''s how to actually <em>enjoy</em> it.</p>

<p><strong>Booking:</strong></p>
<ul>
<li>Book on the official site (uffizi.it) — third-party sites charge €10-20 extra</li>
<li>First slot of the day (8:15 or 8:30) is the least crowded</li>
<li>Tuesday and Wednesday mornings are quieter than weekends</li>
<li>Budget 2-3 hours — more than that and fatigue kills the experience</li>
</ul>

<p><strong>Must-See Works (My Top 10):</strong></p>
<ol>
<li><strong>Botticelli — "The Birth of Venus"</strong> and <strong>"Primavera"</strong> (Rooms 10-14). These are the superstars and they deserve it.</li>
<li><strong>Leonardo da Vinci — "Annunciation"</strong> (Room 35). Early Leonardo at his finest.</li>
<li><strong>Caravaggio — "Medusa"</strong> and <strong>"Sacrifice of Isaac"</strong> (Room 90). Dramatic lighting, emotional intensity.</li>
<li><strong>Raphael — "Madonna of the Goldfinch"</strong> (Room 66). Serene and perfect.</li>
<li><strong>Titian — "Venus of Urbino"</strong> (Room 83). The painting that scandalized Europe.</li>
</ol>

<p><strong>Strategy:</strong></p>
<p>Start with the Botticelli rooms (they get crowded fast), then work your way through at your own pace. Skip rooms that don''t grab you — there''s no rule that says you have to see everything. The upper floor terrace has a café with a view of the Duomo — perfect for a mid-visit espresso break.</p>

<p><strong>Audio Guide:</strong></p>
<p>The official audio guide (€6) is actually excellent. It focuses on the highlights and gives you context that makes the paintings come alive. Worth it, especially if you''re not an art history buff.</p>

<p>Most importantly: slow down. Stand in front of "The Birth of Venus" for 5 full minutes. Notice the details — the flowers falling like rain, the wind in the fabric. This isn''t a checklist. It''s an experience.</p>',
    178,
    10,
    NOW() - INTERVAL '24 days',
    NOW() - INTERVAL '24 days'
  ) RETURNING id INTO v_thread_id;

  INSERT INTO posts (thread_id, author_id, content, created_at, updated_at)
  VALUES (
    v_thread_id, v_user_id,
    '<p>Great guide! One exciting update — <strong>the Vasari Corridor has reopened</strong> after years of renovation! It''s the elevated passageway connecting the Uffizi to Palazzo Pitti over the Ponte Vecchio. Has anyone done the new tour? I''ve heard it''s limited to small groups and includes a self-portrait collection. Definitely on my list for next time.</p>',
    NOW() - INTERVAL '22 days',
    NOW() - INTERVAL '22 days'
  );

  -- ============================================================
  -- 8. Art, History & Culture — "Hidden Churches"
  -- ============================================================
  INSERT INTO threads (category_id, author_id, title, slug, content, view_count, like_count, created_at, updated_at)
  VALUES (
    (SELECT id FROM categories WHERE slug = 'art-history-culture'),
    v_user_id,
    'Hidden Churches of Florence You Shouldn''t Miss',
    'hidden-churches-florence-you-shouldnt-miss',
    '<p>Everyone goes to the Duomo (and you should — it''s extraordinary). But Florence has over 200 churches, and some of the most beautiful ones are the ones tourists walk right past. Here are my favorites:</p>

<p><strong>1. San Miniato al Monte</strong></p>
<p>Up the hill past Piazzale Michelangelo. The Romanesque marble façade is stunning, the interior has an incredible geometric marble floor, and if you time it right (5:30pm in winter, 6pm in summer), you can hear the Benedictine monks sing Gregorian chant. <em>Free entry.</em></p>

<p><strong>2. Santa Maria Novella</strong></p>
<p>Most tourists photograph the façade and keep walking. Go inside (€7.50). The Spanish Chapel frescoes are jaw-dropping, and Masaccio''s "Holy Trinity" is one of the first paintings to use linear perspective. There''s also a gorgeous cloister garden that''s incredibly peaceful.</p>

<p><strong>3. Orsanmichele</strong></p>
<p>This one looks like a regular building from outside — it was actually a grain market converted to a church. The exterior niches hold statues by Donatello, Ghiberti, and Verrocchio. The interior has a stunning Gothic tabernacle by Orcagna. Completely free, rarely crowded.</p>

<p><strong>4. Brancacci Chapel</strong> (inside Santa Maria del Carmine)</p>
<p>The Masaccio frescoes here are considered the foundation of Renaissance painting. Michelangelo studied these as a young artist. Visits are limited to 30 minutes with a max of 30 people — book online. €10 but worth every cent.</p>

<p><strong>5. Basilica di Santo Spirito</strong></p>
<p>Plain façade hides a beautiful Brunelleschi interior. The piazza outside is one of the best people-watching spots in Florence. Check if there''s an evening concert — the acoustics are special.</p>

<p>The beauty of visiting these churches is that you''re often alone or nearly alone. No crowds, no selfie sticks — just you and 600 years of art and devotion.</p>',
    88,
    8,
    NOW() - INTERVAL '18 days',
    NOW() - INTERVAL '18 days'
  ) RETURNING id INTO v_thread_id;

  INSERT INTO posts (thread_id, author_id, content, created_at, updated_at)
  VALUES (
    v_thread_id, v_user_id,
    '<p>San Miniato at sunset is genuinely one of the most beautiful experiences in Florence. The walk up from the river gives you these incredible views, and then you arrive at this peaceful church on the hill above it all. If you stay for vespers with the monks, you will never forget it. We visited on our last evening and it was the perfect way to say goodbye to the city.</p>',
    NOW() - INTERVAL '16 days',
    NOW() - INTERVAL '16 days'
  );

  -- ============================================================
  -- 9. Ask a Local Guide — "What Most Tourists Miss"
  -- ============================================================
  INSERT INTO threads (category_id, author_id, title, slug, content, view_count, like_count, created_at, updated_at)
  VALUES (
    (SELECT id FROM categories WHERE slug = 'ask-a-guide'),
    v_user_id,
    'What''s the One Thing Most Tourists Miss in Florence?',
    'what-most-tourists-miss-in-florence',
    '<p>After guiding visitors around Florence for several years, I can tell you the one thing that almost everyone misses: <strong>the artisan workshops of Oltrarno</strong>.</p>

<p>The area south of the Arno river — particularly along Via Maggio, Borgo San Frediano, and Via Santo Spirito — is home to craftspeople who still practice techniques that haven''t changed in centuries. Bookbinders, goldsmiths, woodworkers, leather artisans, paper marblers, mosaic makers.</p>

<p>Most workshops have open doors. You can peek in, watch them work, and often have a conversation. These aren''t performances for tourists — these are real artisans doing real work. Many of them are third or fourth generation in the same workshop.</p>

<p><strong>Other things most tourists miss:</strong></p>

<ul>
<li><strong>Fiesole</strong> — a hilltop town 20 minutes by bus from Florence center. Roman amphitheater, Etruscan ruins, and a panoramic view of the entire Florence valley. Bus #7 from Piazza San Marco. €1.70.</li>
<li><strong>Early morning at San Lorenzo Market</strong> — Before 8am, the Mercato Centrale is pure local life. Butchers preparing the day''s cuts, cheese vendors arranging their displays, espresso at the standing bar. No tourists, just Florence doing what Florence does.</li>
<li><strong>The Rose Garden (Giardino delle Rose)</strong> — Free entry, beautiful in May, and most people don''t even know it exists. It''s on the way up to Piazzale Michelangelo.</li>
<li><strong>Via dei Neri for street food</strong> — Locals grab lampredotto, tripe sandwiches, and suppli here. Skip the Ponte Vecchio souvenir shops and explore this street instead.</li>
</ul>

<p>Florence rewards the curious. Put away the guidebook for a few hours, wander without a destination, and see what you discover. That''s when the real magic happens.</p>',
    163,
    13,
    NOW() - INTERVAL '23 days',
    NOW() - INTERVAL '23 days'
  ) RETURNING id INTO v_thread_id;

  INSERT INTO posts (thread_id, author_id, content, created_at, updated_at)
  VALUES (
    v_thread_id, v_user_id,
    '<p>I''d add the <strong>Bardini Gardens</strong> to this list! Way less crowded than Boboli (right next door) with arguably better views of the city. The wisteria tunnel in April/May is Instagram-famous but somehow the garden itself stays quiet. Free with some museum cards, otherwise €10 combined with Boboli.</p>',
    NOW() - INTERVAL '21 days',
    NOW() - INTERVAL '21 days'
  );

  INSERT INTO posts (thread_id, author_id, content, created_at, updated_at)
  VALUES (
    v_thread_id, v_user_id,
    '<p>The <strong>Officina Profumo-Farmaceutica di Santa Maria Novella</strong>! It''s one of the oldest pharmacies in the world — founded by Dominican monks in 1221. The building alone is worth visiting (frescoed ceilings, marble floors), and they still make perfumes, soaps, and remedies using original recipes. It''s technically a shop but feels like a museum. Can''t believe more people don''t know about it.</p>',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '20 days'
  );

  -- ============================================================
  -- 10. Seasonal Florence — "Florence in February"
  -- ============================================================
  INSERT INTO threads (category_id, author_id, title, slug, content, view_count, like_count, created_at, updated_at)
  VALUES (
    (SELECT id FROM categories WHERE slug = 'seasonal'),
    v_user_id,
    'Florence in February - What to Expect',
    'florence-in-february-what-to-expect',
    '<p>February is one of the quietest months in Florence and honestly? That can be a wonderful thing. Here''s what you''re in for.</p>

<p><strong>Weather:</strong></p>
<p>Expect temperatures between 3-12°C (37-54°F). It can rain, it can be grey, and the occasional sunny day will feel like a gift. Pack layers, a waterproof jacket, and comfortable shoes that can handle wet cobblestones. Evenings are cold — bring a proper coat.</p>

<p><strong>Crowds:</strong></p>
<p>Almost none. This is the biggest advantage. You can walk into the Uffizi without a long wait, sit in any restaurant without a reservation, and have the Ponte Vecchio practically to yourself. It''s Florence as Florentines experience it.</p>

<p><strong>What''s Special About February:</strong></p>
<ul>
<li><strong>Carnevale</strong> — Florence has its own carnival celebrations, smaller and more authentic than Venice. Look for events in Piazza Ognissanti and around the Duomo.</li>
<li><strong>Truffle season</strong> — Black truffle is in full swing. Restaurants feature truffle pastas, truffle eggs, truffle everything. Try <em>tagliolini al tartufo</em> — fresh egg pasta with shaved truffle. Pure heaven.</li>
<li><strong>Cozy wine bars</strong> — Florence''s enotecas (wine bars) are at their coziest. Imagine sitting by a fire with a glass of Brunello, rain pattering outside, a plate of pecorino and honey in front of you.</li>
<li><strong>Sales</strong> — Winter sales (<em>saldi</em>) run through February. Leather goods, fashion, shoes — Florence is a great shopping city and this is when bargains happen.</li>
</ul>

<p><strong>What to Be Aware Of:</strong></p>
<ul>
<li>Some smaller restaurants and B&amp;Bs may close for winter breaks</li>
<li>Daylight hours are shorter (sunset around 5:30pm)</li>
<li>Boboli Gardens are less appealing in winter rain</li>
<li>Some outdoor attractions are better saved for warmer months</li>
</ul>

<p>But if you like the idea of a quieter, more intimate Florence — February is your month. The city feels like a secret that belongs just to you.</p>',
    72,
    5,
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days'
  ) RETURNING id INTO v_thread_id;

  INSERT INTO posts (thread_id, author_id, content, created_at, updated_at)
  VALUES (
    v_thread_id, v_user_id,
    '<p>February is actually wonderful — went last year and loved it. No lines at the Uffizi! Walked right in at 10am on a Tuesday. The truffle pasta at a little trattoria near Santo Spirito was one of the best meals of my life. Only downside was 2 rainy days, but we just ducked into churches and cafés. Honestly, the rain made everything more atmospheric.</p>',
    NOW() - INTERVAL '13 days',
    NOW() - INTERVAL '13 days'
  );

  -- ============================================================
  -- 11. Reviews & Recommendations — "Walking Tours Review"
  -- ============================================================
  INSERT INTO threads (category_id, author_id, title, slug, content, view_count, like_count, created_at, updated_at)
  VALUES (
    (SELECT id FROM categories WHERE slug = 'reviews'),
    v_user_id,
    'Honest Review of Florence Walking Tours (I Did 3)',
    'honest-review-florence-walking-tours',
    '<p>On our recent trip I signed up for three different walking tours to compare them. Here''s my honest breakdown.</p>

<p><strong>Tour 1: Large Group Free Walking Tour</strong></p>
<p>About 25 people, 2.5 hours, tip-based. The guide was enthusiastic but it was hard to hear in a big group, and we spent a lot of time waiting for everyone at crossings. Covered the main sights (Duomo, Piazza della Signoria, Ponte Vecchio) with surface-level history. Good if you want a quick orientation on day one, but don''t expect depth.</p>
<p><em>Rating: 3/5 — Fine for a free overview</em></p>

<p><strong>Tour 2: Small Group (8 people) Paid Tour</strong></p>
<p>€35 per person, 3 hours, guide was an art history graduate. This was noticeably better. We went beyond the main squares into quieter streets, heard stories about the Medici that I''d never read in any guidebook, and the guide adjusted the pace based on our interests. Small group meant we could actually have a conversation and ask questions.</p>
<p><em>Rating: 4.5/5 — Excellent value</em></p>

<p><strong>Tour 3: Private Local Guide Experience</strong></p>
<p>€120 for 2 people, 3 hours, completely customized. Our guide grew up in Florence and took us to her favorite spots — a hidden courtyard, a church she went to as a child, her family''s favorite coffee bar. She told us stories about Florence today, not just its past. This felt less like a tour and more like exploring the city with a friend who happened to know everything about it.</p>
<p><em>Rating: 5/5 — Worth every cent</em></p>

<p><strong>My Takeaway:</strong></p>
<p>The smaller the group, the better the experience. The price difference between a mediocre large group tour and an amazing small group one is €20-30 — absolutely worth it. If you can afford a private guide, it transforms your entire understanding of the city.</p>',
    112,
    6,
    NOW() - INTERVAL '19 days',
    NOW() - INTERVAL '19 days'
  ) RETURNING id INTO v_thread_id;

  INSERT INTO posts (thread_id, author_id, content, created_at, updated_at)
  VALUES (
    v_thread_id, v_user_id,
    '<p>Small groups make <em>such</em> a difference! We did a Florence With Locals tour last autumn and it was genuinely the highlight of our entire trip. Our guide took us through the Oltrarno artisan district and we saw craftspeople at work — a paper marbler, a goldsmith, a leather bookbinder. These are places we never would have found on our own. Plus they knew every backstreet and took us to a coffee bar where we were the only non-Italians. That''s the kind of experience you can''t get from a guidebook!</p>',
    NOW() - INTERVAL '17 days',
    NOW() - INTERVAL '17 days'
  );

  -- ============================================================
  -- 12. Off the Beaten Path — "Secret Viewpoints"
  -- ============================================================
  INSERT INTO threads (category_id, author_id, title, slug, content, view_count, like_count, created_at, updated_at)
  VALUES (
    (SELECT id FROM categories WHERE slug = 'off-beaten-path'),
    v_user_id,
    'Secret Viewpoints in Florence Most Tourists Never Find',
    'secret-viewpoints-florence-tourists-never-find',
    '<p>Everyone knows Piazzale Michelangelo. It''s famous for a reason — the view is magnificent. But it''s also packed with tour buses and souvenir stalls. Here are 5 viewpoints that locals love but tourists rarely discover:</p>

<p><strong>1. Giardino delle Rose (Rose Garden)</strong></p>
<p>Just below Piazzale Michelangelo on the hillside. Free entry. The garden itself has 350 varieties of roses (best in May), plus sculptures by Jean-Michel Folon scattered throughout. The views across to the Duomo are just as good as from the piazzale, with a fraction of the people. There are benches where you can sit in peace.</p>

<p><strong>2. Torre di San Niccolò</strong></p>
<p>One of the old city gate towers in the San Niccolò neighborhood. In summer they open the top for free guided visits (30 people at a time). The 360-degree view from the top is intimate and powerful — you''re right at the level of the rooftops. Check opening times as they change seasonally.</p>

<p><strong>3. Forte di Belvedere</strong></p>
<p>A 16th-century fortress above the Boboli Gardens. When open (it hosts art exhibitions in summer), the panoramic terrace offers sweeping views in every direction. Even if the fortress is closed, the walk up through the quiet Costa San Giorgio street is lovely.</p>

<p><strong>4. Fiesole Roman Amphitheater</strong></p>
<p>Take bus #7 from Piazza San Marco (20 minutes). The ancient Roman amphitheater sits on a hilltop overlooking the entire Florence valley. On a clear day you can see for miles. The site also has Etruscan ruins and a small museum. €12 entry. Visit late afternoon for the best light.</p>

<p><strong>5. Rooftop Terraces</strong></p>
<p>Several hotels and bars have rooftop terraces open to non-guests. A Negroni or Aperol Spritz at sunset with the Duomo glowing in front of you is an experience worth the cocktail price. Dress smart-casual and arrive 30 minutes before sunset for the best seats.</p>

<p>The best views in Florence aren''t always the most famous ones. Sometimes the magic is in finding a quiet spot where the city reveals itself just to you.</p>',
    93,
    8,
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '14 days'
  ) RETURNING id INTO v_thread_id;

  INSERT INTO posts (thread_id, author_id, content, created_at, updated_at)
  VALUES (
    v_thread_id, v_user_id,
    '<p>The Rose Garden in May is absolutely incredible — and free! We stumbled on it by accident while walking up to Piazzale Michelangelo and ended up spending an hour just sitting on a bench looking at the view. The Folon sculptures add this wonderful whimsical element too. Pro tip: bring some bread and cheese from the market and have a picnic on the grass. Best free activity in Florence, hands down.</p>',
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '12 days'
  );

  -- ============================================================
  -- 13. Tourist Info — "Airport to City Center"
  -- ============================================================
  INSERT INTO threads (category_id, author_id, title, slug, content, view_count, like_count, created_at, updated_at)
  VALUES (
    (SELECT id FROM categories WHERE slug = 'tourist-info'),
    v_user_id,
    'Florence Airport to City Center - All Transport Options Compared',
    'florence-airport-to-city-center-transport-options',
    '<p>Florence''s airport (Amerigo Vespucci / FLR) is only 5km from the city center, which makes getting in easy. Here''s every option compared:</p>

<p><strong>1. Tramvia T2 (Tram) — Best Overall</strong></p>
<ul>
<li><strong>Price:</strong> €1.70 (buy at machines in the terminal or use contactless)</li>
<li><strong>Time:</strong> ~20 minutes to Santa Maria Novella station</li>
<li><strong>Frequency:</strong> Every 4-5 minutes during the day</li>
<li><strong>Pros:</strong> Cheap, fast, reliable, no traffic</li>
<li><strong>Cons:</strong> Can be crowded with luggage during peak hours</li>
<li>The T2 tram opened relatively recently and completely changed the airport transfer game. It''s clean, modern, and drops you right at the main train station.</li>
</ul>

<p><strong>2. Volainbus (Airport Bus)</strong></p>
<ul>
<li><strong>Price:</strong> €6 one-way, €10 return</li>
<li><strong>Time:</strong> 20-30 minutes depending on traffic</li>
<li><strong>Frequency:</strong> Every 30 minutes</li>
<li><strong>Pros:</strong> Direct, luggage space underneath</li>
<li><strong>Cons:</strong> More expensive than tram, subject to traffic, less frequent</li>
<li>Honestly, since the tram opened, there''s less reason to use this unless you have enormous luggage.</li>
</ul>

<p><strong>3. Taxi</strong></p>
<ul>
<li><strong>Price:</strong> €22 flat rate to city center (€25.30 on Sundays/holidays/night)</li>
<li><strong>Time:</strong> 15-20 minutes</li>
<li><strong>Pros:</strong> Door-to-door, good for groups, fixed price</li>
<li><strong>Cons:</strong> Most expensive option, traffic can slow you down</li>
<li>Use official white taxis from the rank only. The flat rate is posted on a sign. Don''t accept rides from people approaching you inside the terminal.</li>
</ul>

<p><strong>4. Private Transfer</strong></p>
<ul>
<li><strong>Price:</strong> €35-50 depending on service</li>
<li><strong>Time:</strong> 15-20 minutes</li>
<li><strong>Pros:</strong> Pre-booked, driver waiting with your name, no stress</li>
<li><strong>Cons:</strong> Most expensive, needs advance booking</li>
<li>Worth it if you''re arriving late at night or have a lot of luggage. Some hotels arrange this for you.</li>
</ul>

<p><strong>My recommendation:</strong> Take the T2 tram unless you have heavy luggage or it''s very late. It''s the best value by far and drops you right in the center of Florence.</p>',
    234,
    9,
    NOW() - INTERVAL '21 days',
    NOW() - INTERVAL '21 days'
  ) RETURNING id INTO v_thread_id;

  INSERT INTO posts (thread_id, author_id, content, created_at, updated_at)
  VALUES (
    v_thread_id, v_user_id,
    '<p>The tram is by far the best option now. €1.70 and takes 20 minutes — you can''t beat it. One tip: validate your ticket before boarding! There are machines at the tram stop. Inspectors do check and the fine is €50+. Also, if you have a large suitcase, try to stand near the doors rather than squeezing into the middle of the tram during rush hour.</p>',
    NOW() - INTERVAL '19 days',
    NOW() - INTERVAL '19 days'
  );

  INSERT INTO posts (thread_id, author_id, content, created_at, updated_at)
  VALUES (
    v_thread_id, v_user_id,
    '<p>If you have heavy luggage, I''d honestly just get a taxi. We tried the tram with two big suitcases and a stroller and it was doable but stressful, especially navigating the station afterward. The taxi was about €22 fixed rate and the driver helped load everything. Money well spent when you''re tired from traveling. For the return trip to the airport, our hotel called one and it arrived in 5 minutes.</p>',
    NOW() - INTERVAL '18 days',
    NOW() - INTERVAL '18 days'
  );

  -- ============================================================
  -- 14. Tourist Info — "Firenze Card"
  -- ============================================================
  INSERT INTO threads (category_id, author_id, title, slug, content, view_count, like_count, created_at, updated_at)
  VALUES (
    (SELECT id FROM categories WHERE slug = 'tourist-info'),
    v_user_id,
    'Do You Need a Firenze Card? Honest Analysis',
    'do-you-need-firenze-card-honest-analysis',
    '<p>The Firenze Card costs €85 and gives you entry to 70+ museums and churches over 72 hours. Sounds like a great deal, but is it?</p>

<p><strong>What You Get:</strong></p>
<ul>
<li>One entry to each participating museum/church (including Uffizi, Accademia, Palazzo Pitti, Boboli Gardens)</li>
<li>Skip-the-line access at most venues</li>
<li>72 hours from first use</li>
<li>Free public transport add-on available</li>
</ul>

<p><strong>When It''s Worth It:</strong></p>
<p>If you''re planning to visit 4+ major museums and you value skip-the-line access, the card pays for itself. Here''s a sample calculation:</p>
<ul>
<li>Uffizi: €25</li>
<li>Accademia: €16</li>
<li>Palazzo Pitti + Boboli: €22</li>
<li>Museo dell''Opera del Duomo: €18</li>
<li><strong>Total: €81</strong> — nearly the card price, plus you get skip-the-line</li>
</ul>

<p><strong>When It''s NOT Worth It:</strong></p>
<ul>
<li>If you''re only doing the Uffizi and Accademia (total: €41 — well under €85)</li>
<li>If you prefer slow travel — visiting 1 museum per day over 5 days</li>
<li>If you''re visiting in low season when there are no lines anyway</li>
<li>If you''re eligible for EU under-18 free entry</li>
</ul>

<p><strong>Alternatives:</strong></p>
<p>Individual tickets booked online in advance now include timed entry, which largely eliminates the line problem. This is free or costs €4 booking fee. For most visitors doing 2-3 museums, individual tickets are cheaper.</p>

<p><strong>My Verdict:</strong></p>
<p>Skip the card if you''re staying 1-2 days. Consider it if you''re staying 3+ days and plan an intensive museum blitz. Otherwise, just book individual tickets online with timed entry and save the €40+ difference for a nice dinner.</p>',
    108,
    4,
    NOW() - INTERVAL '12 days',
    NOW() - INTERVAL '12 days'
  ) RETURNING id INTO v_thread_id;

  INSERT INTO posts (thread_id, author_id, content, created_at, updated_at)
  VALUES (
    v_thread_id, v_user_id,
    '<p>Agreed — skip it if you''re only doing the big two (Uffizi + Accademia). We booked individual timed tickets and walked right in without any wait. The booking fee was €4 each, so total was €45 per person vs €85 for the card. The card only makes sense if you genuinely want to do 5+ museums in 3 days, and honestly, that''s a recipe for museum fatigue. Better to do fewer things slowly and actually enjoy them.</p>',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days'
  );

  -- ============================================================
  -- 15. Typical Tuscan Recipes — "Ribollita Recipe"
  -- ============================================================
  INSERT INTO threads (category_id, author_id, title, slug, content, view_count, like_count, created_at, updated_at)
  VALUES (
    (SELECT id FROM categories WHERE slug = 'tuscan-recipes'),
    v_user_id,
    'Authentic Ribollita Recipe - The Way My Nonna Made It',
    'authentic-ribollita-recipe-nonna',
    '<p>Ribollita is Tuscany''s most famous soup, and every family has their version. This is how my grandmother made it, and how I still make it today. The name means "reboiled" because it was originally made with leftover minestrone, reheated the next day with stale bread.</p>

<p><strong>Ingredients (serves 6):</strong></p>
<ul>
<li>400g dried cannellini beans (soaked overnight) — or 2 cans, drained</li>
<li>1 large onion, diced</li>
<li>2 carrots, diced</li>
<li>2 celery stalks, diced</li>
<li>3 cloves garlic, minced</li>
<li>1 bunch cavolo nero (Tuscan black kale), stems removed, roughly chopped</li>
<li>½ savoy cabbage, shredded</li>
<li>1 bunch Swiss chard, chopped</li>
<li>400g can whole peeled tomatoes, crushed by hand</li>
<li>300g stale Tuscan bread (unsalted!), torn into chunks</li>
<li>Good extra virgin olive oil — Tuscan if possible</li>
<li>1 sprig rosemary, 2 sage leaves, 1 bay leaf</li>
<li>Salt and black pepper</li>
<li>Parmigiano Reggiano rind (optional but wonderful)</li>
</ul>

<p><strong>Method:</strong></p>
<ol>
<li>If using dried beans, cook them in unsalted water until tender (about 1.5 hours). Reserve the cooking liquid. Purée half the beans and keep the other half whole.</li>
<li>In a large heavy pot, warm generous olive oil over medium heat. Add the onion, carrot, and celery. Cook gently for 10 minutes until soft — don''t rush this.</li>
<li>Add the garlic, rosemary, sage, and bay leaf. Cook 2 more minutes.</li>
<li>Add the tomatoes and cook until they break down, about 10 minutes.</li>
<li>Add the cavolo nero, cabbage, and chard. Stir until they wilt.</li>
<li>Add the puréed beans, whole beans, and enough bean cooking liquid (or water) to create a thick soupy consistency. Add the Parmigiano rind if using.</li>
<li>Simmer gently for 30 minutes, stirring occasionally.</li>
<li>Layer the stale bread chunks into the soup, pushing them under the surface. Cook 15 more minutes until the bread dissolves and thickens everything beautifully.</li>
<li>Remove from heat. Here''s the secret: <strong>let it sit for several hours, or overnight</strong>. Ribollita is always better the next day.</li>
<li>Reheat gently (that''s the "reboiling"). Serve in bowls drizzled generously with your best olive oil, with a crack of black pepper.</li>
</ol>

<p><strong>My nonna''s tips:</strong></p>
<ul>
<li>The olive oil at the end is not a garnish — it''s an ingredient. Use the best you can afford and be generous.</li>
<li>Tuscan bread is traditionally unsalted. If yours is salted, reduce the salt in the soup.</li>
<li>Never, ever add pasta. That makes it minestrone. Ribollita is bread soup. The bread is non-negotiable.</li>
<li>It should be thick enough that a wooden spoon stands up in it.</li>
</ul>

<p><em>In bocca al lupo!</em> (Good luck!) Let me know if you try it.</p>',
    67,
    6,
    NOW() - INTERVAL '16 days',
    NOW() - INTERVAL '16 days'
  ) RETURNING id INTO v_thread_id;

  INSERT INTO posts (thread_id, author_id, content, created_at, updated_at)
  VALUES (
    v_thread_id, v_user_id,
    '<p>This is <em>exactly</em> how my host family in Florence made it when I did a study abroad semester there! The key is really, really good olive oil at the end — they used oil from their cousin''s farm in the Chianti hills and the difference was incredible. I also learned that some families add a drizzle of fresh onion juice on top, which sounds strange but adds this lovely sharpness. Thank you for sharing this, it brought back so many memories!</p>',
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '14 days'
  );

  -- ============================================================
  -- 16. Typical Tuscan Recipes — "Bistecca alla Fiorentina"
  -- ============================================================
  INSERT INTO threads (category_id, author_id, title, slug, content, view_count, like_count, created_at, updated_at)
  VALUES (
    (SELECT id FROM categories WHERE slug = 'tuscan-recipes'),
    v_user_id,
    'How to Make Perfect Bistecca alla Fiorentina at Home',
    'perfect-bistecca-alla-fiorentina-at-home',
    '<p>The Florentine T-bone steak (<em>bistecca alla fiorentina</em>) is probably the most iconic dish in Tuscan cuisine. It seems simple — and it is — but there are rules, and Florentines take them very seriously.</p>

<p><strong>Choosing the Meat:</strong></p>
<p>In Florence, this is traditionally made with Chianina beef — a massive white breed that''s been raised in Tuscany since Etruscan times. Outside of Italy, use the best quality T-bone or porterhouse you can find. Dry-aged is ideal. The cut <strong>must</strong> include both the fillet and the strip on either side of the bone.</p>

<p><strong>The Rules:</strong></p>
<ul>
<li><strong>Thickness:</strong> At least 5cm (2 inches). This is not a thin steak. In Florence, they''re often 6-7cm.</li>
<li><strong>Weight:</strong> 1-1.5kg. This is meant to be shared between 2-3 people.</li>
<li><strong>Temperature:</strong> Bring the steak to room temperature before cooking. Take it out of the fridge at least 1 hour before.</li>
<li><strong>Seasoning:</strong> Salt and olive oil. That''s it. No marinades, no rubs, no garlic butter. The quality of the meat speaks for itself.</li>
<li><strong>Doneness:</strong> <em>Al sangue</em> (rare) to medium-rare. Never well done. If you order this well done in Florence, the chef may refuse. I''m only half joking.</li>
</ul>

<p><strong>The Method:</strong></p>
<ol>
<li>Get your grill (charcoal preferred) or cast iron pan <strong>blazing hot</strong>. You want at least 280°C/550°F.</li>
<li>Do NOT oil the steak before grilling. Place it directly on the grill.</li>
<li>Cook 5-7 minutes on the first side without moving it. You want a deep brown crust.</li>
<li>Flip once. Cook 5-7 minutes on the second side.</li>
<li>Stand the steak on its bone edge for 2-3 minutes to render the fat along the bone.</li>
<li>Rest for 5 minutes on a warm plate.</li>
<li>Season with <strong>coarse sea salt</strong> and a drizzle of excellent extra virgin olive oil. Squeeze of lemon is optional and debated (purists say no).</li>
</ol>

<p><strong>Where to Eat It in Florence:</strong></p>
<p>If you''d rather leave it to the professionals: Trattoria Sostanza, Buca Mario, Perseus (near Piazza della Libertà), and the market stalls in Mercato Centrale all do excellent versions. Expect to pay €45-65 per steak in a restaurant. It''s always priced by weight (per etto / per 100g).</p>

<p>This steak is a celebration of simplicity. The best ingredients, prepared with respect. That''s the heart of Tuscan cooking.</p>',
    58,
    5,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days'
  ) RETURNING id INTO v_thread_id;

  INSERT INTO posts (thread_id, author_id, content, created_at, updated_at)
  VALUES (
    v_thread_id, v_user_id,
    '<p>The secret is definitely the thickness — at least 5cm (2 inches)! I made the mistake of trying with a regular supermarket T-bone that was maybe 3cm thick and it was overcooked before any crust formed. Once I found a proper butcher who cut it to spec, the difference was night and day. Also totally agree on charcoal over gas — it adds a smokiness that you just can''t replicate. Great write-up!</p>',
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '8 days'
  );

  -- ============================================================
  -- 17. What to Do in Tuscany — "Best Day Trips"
  -- ============================================================
  INSERT INTO threads (category_id, author_id, title, slug, content, view_count, like_count, created_at, updated_at)
  VALUES (
    (SELECT id FROM categories WHERE slug = 'what-to-do'),
    v_user_id,
    'Best Day Trips from Florence - Ranked by a Local',
    'best-day-trips-from-florence-ranked-local',
    '<p>Florence is an incredible base for exploring Tuscany and beyond. I grew up here and these are my honest rankings of the best day trips, from most to least recommended.</p>

<p><strong>1. Siena</strong> — 1h15 by bus, 1h30 by train</p>
<p>Florence''s historic rival. The shell-shaped Piazza del Campo is one of Italy''s most beautiful squares. Visit the Duomo (the marble floor is breathtaking), climb the Torre del Mangia, and eat pici pasta. If you can time it for the Palio horse race (July 2 or August 16), it''s one of the most intense cultural experiences in Italy.</p>

<p><strong>2. San Gimignano</strong> — 1h15 by bus (change at Poggibonsi)</p>
<p>The "Manhattan of the Middle Ages" with its 14 surviving medieval towers. Tiny, gorgeous, and a UNESCO World Heritage Site. Try the world-champion gelato at Gelateria Dondoli in the main square. Best in the morning before tour buses arrive.</p>

<p><strong>3. Lucca</strong> — 1h20 by train</p>
<p>The most underrated city in Tuscany. Rent bikes and ride along the top of the Renaissance city walls (4km loop). Beautiful churches, excellent food, a relaxed atmosphere that''s very different from Florence. The oval piazza (Piazza dell''Anfiteatro) was built inside a Roman amphitheater.</p>

<p><strong>4. Val d''Orcia</strong> — 2h by car (really needs a car)</p>
<p>The landscape you see on every Tuscan postcard. Rolling hills, lone cypress trees, golden fields. Visit Pienza (the "ideal city" with incredible pecorino cheese), Montalcino (home of Brunello wine), and Bagno Vignoni (a village built around a hot spring pool). This is a full-day trip.</p>

<p><strong>5. Volterra</strong> — 2h by bus</p>
<p>Etruscan hilltop town with dramatic views. More authentic and less crowded than San Gimignano. Famous for alabaster craftwork. The Roman theater ruins are impressive and entry is cheap.</p>

<p><strong>6. Pisa</strong> — 1h by train</p>
<p>Yes, the tower leans. It''s worth seeing once, and the Piazza dei Miracoli is genuinely beautiful. But beyond the tower and baptistery, Pisa is a university town without much tourist appeal. Easy half-day trip — combine it with Lucca.</p>

<p><strong>7. Cinque Terre</strong> — 2h30 by train</p>
<p>Technically in Liguria, not Tuscany, but doable as a long day trip. The five colorful fishing villages are stunning but very crowded in summer. Go in spring or fall. It''s a long day — leave by 7am, back by 9pm.</p>

<p><strong>8. Cortona</strong> — 1h30 by train</p>
<p>Made famous by "Under the Tuscan Sun." Charming hilltop town with incredible views over Lake Trasimeno. Lovely for a half-day but limited in things to do. Best combined with a drive through the Valdichiana.</p>

<p>My top tip: don''t try to cram too many day trips in. Florence itself deserves your time. Pick 1-2 that call to you and give them a full, unhurried day.</p>',
    143,
    11,
    NOW() - INTERVAL '17 days',
    NOW() - INTERVAL '17 days'
  ) RETURNING id INTO v_thread_id;

  INSERT INTO posts (thread_id, author_id, content, created_at, updated_at)
  VALUES (
    v_thread_id, v_user_id,
    '<p>Lucca is SO underrated! We almost skipped it because everyone talks about Siena and San Gimignano, but it ended up being our favorite day trip. Renting bikes and riding the city walls was magical — you get this 360-degree view of the terracotta rooftops and the Apuan Alps in the distance. The whole city has this relaxed, lived-in feel that''s very different from the tourist intensity of Florence. Plus the food was amazing and cheaper than Florence. We''re already planning to go back and spend a whole weekend there.</p>',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '15 days'
  );

  -- ============================================================
  -- 18. Traveling in Tuscany — "Renting a Car"
  -- ============================================================
  INSERT INTO threads (category_id, author_id, title, slug, content, view_count, like_count, created_at, updated_at)
  VALUES (
    (SELECT id FROM categories WHERE slug = 'traveling-tuscany'),
    v_user_id,
    'Renting a Car in Tuscany - Everything You Need to Know',
    'renting-car-tuscany-everything-you-need-to-know',
    '<p>A car opens up a whole different side of Tuscany — tiny hilltop villages, vineyard roads, farmhouse lunches. But there are some things you absolutely need to know before you rent.</p>

<p><strong>ZTL Zones — READ THIS FIRST</strong></p>
<p>ZTL stands for <em>Zona a Traffico Limitato</em> — restricted traffic zones in historic city centers. Florence, Siena, San Gimignano, Lucca, and most old towns have them. Cameras automatically photograph your license plate, and <strong>you will get fined</strong>. Each entry is a separate fine (€80-100+), and your rental company will add an admin fee on top. I''ve heard horror stories of people getting 6-8 fines without even knowing they entered a ZTL.</p>
<p><strong>How to avoid it:</strong> Look for round red and white signs with "ZTL" or "Zona Traffico Limitato." Use Google Maps or Waze — they usually (but not always) warn you. Park outside the ZTL and walk in.</p>

<p><strong>Choosing Your Car:</strong></p>
<ul>
<li><strong>Size:</strong> Get the smallest car you''re comfortable with. Tuscan hill town streets and parking spots are narrow. A Fiat 500 is practically a local tradition for a reason.</li>
<li><strong>Transmission:</strong> Most European rental cars are manual (stick shift). If you need automatic, book well in advance — they''re limited and cost more.</li>
<li><strong>Insurance:</strong> Get full coverage (CDW + theft protection). Italian roads can be narrow and other drivers are... confident. Consider the rental company''s excess reduction or buy third-party coverage.</li>
</ul>

<p><strong>Where to Rent:</strong></p>
<p>Rent from Florence airport rather than the city center. Better selection, easier pickup/return, and you avoid driving through Florence itself (which you don''t want to do — ZTL, one-way streets, chaos). Major companies at the airport: Hertz, Avis, Europcar, Maggiore.</p>

<p><strong>Driving Tips:</strong></p>
<ul>
<li><strong>Autostrada (motorway)</strong> — Toll roads. Take a ticket when you enter, pay when you exit. Keep cash or a credit card handy for the Telepass-free lanes.</li>
<li><strong>Speed limits</strong> — 130 km/h on autostrada, 110 on dual carriageways, 90 on regular roads, 50 in towns. Speed cameras are everywhere and fines arrive by post months later.</li>
<li><strong>Fuel</strong> — Most stations have "self" (self-service, cheaper) and "servito" (full-service, pricier). Diesel is <em>gasolio</em>, petrol is <em>benzina</em>. Don''t mix them up.</li>
<li><strong>Parking</strong> — White lines = free. Blue lines = paid (find a meter nearby). Yellow lines = reserved (residents, disabled). Never park on yellow lines.</li>
<li><strong>Hill town parking</strong> — Most hilltop towns have designated parking lots at the base. Park there and walk or take the shuttle up. Don''t try to drive up narrow medieval streets.</li>
</ul>

<p><strong>My recommendation:</strong> Don''t rent a car for Florence itself — you don''t need it and it''s a headache. Rent it for 2-3 days specifically for your Tuscany exploration (Chianti, Val d''Orcia, hill towns), then return it before going back to the city.</p>',
    128,
    7,
    NOW() - INTERVAL '11 days',
    NOW() - INTERVAL '11 days'
  ) RETURNING id INTO v_thread_id;

  INSERT INTO posts (thread_id, author_id, content, created_at, updated_at)
  VALUES (
    v_thread_id, v_user_id,
    '<p>ZTL cameras are <strong>NO JOKE</strong>. We got 6 fines and didn''t even know until 3 months later when the rental company forwarded them. Total cost: over €600 including admin fees. The problem was our GPS routed us through the center of a small town and we had no idea there was a ZTL. Now I always double-check the ZTL maps before driving anywhere near a town center. Learn from my expensive mistake — save the ZTL maps offline before your trip!</p>',
    NOW() - INTERVAL '9 days',
    NOW() - INTERVAL '9 days'
  );

  INSERT INTO posts (thread_id, author_id, content, created_at, updated_at)
  VALUES (
    v_thread_id, v_user_id,
    '<p>Great guide! One critical thing to add: <strong>book automatic transmission well in advance</strong>. We waited until 2 weeks before our trip and there were literally zero automatic cars available at Florence airport. Ended up at a smaller agency paying almost double. Most European rental fleets are 80%+ manual. If you can''t drive manual, book your automatic 2-3 months ahead, especially in peak season.</p>',
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '8 days'
  );

  RAISE NOTICE 'Seed content inserted successfully — 18 threads with replies across all categories';

END $$;
