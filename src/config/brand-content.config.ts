export const BRAND_CONTENT_HEADING = 'Buy Everyday Demifine® Jewellery, Curated by Shraddha Kapoor';

export const BRAND_CONTENT_INTRO =
  "Palmonas Jewellery — Everyday Luxury That Doesn't Sit in a Box. Modern minimalism meets real-life wearability. Demifine® jewellery made with 925 sterling silver, surgical-grade stainless steel, and thick layers of rhodium, 18k gold vermeil, and 18k gold tone plating — waterproof, skin-safe, and made for every day.";

export const BRAND_CONTENT_CLOSING_PREFIX =
  "From daily-wear gold chains for women, to fuss-free diamond rings, to modern takes on the silver mangalsutra, Palmonas is all about jewellery that lives with you. Because luxury shouldn't sit in a box — it should move through your day, your style, and your story. Buy online or visit one of our jewellery stores near you across India. We ship across the country and worldwide. ";

export const BRAND_CONTENT_CLOSING_LINK_TEXT = 'Explore our collection';
export const BRAND_CONTENT_CLOSING_LINK_HREF = '/collections/all';

export interface BrandContentFaqItem {
  question: string;
  answer: string;
}

export type BrandContentBlock =
  | { type: 'paragraph'; text: string; italic?: boolean; mutedLabel?: boolean }
  | { type: 'bullets'; label?: string; items: string[] }
  | { type: 'subsection'; title: string; paragraphs: string[] }
  | { type: 'faq'; items: BrandContentFaqItem[] };

export interface BrandAccordionSection {
  id: string;
  title: string;
  defaultOpen?: boolean;
  blocks: BrandContentBlock[];
}

export const brandAccordionSections: BrandAccordionSection[] = [
  {
    id: 'about-palmonas',
    title: 'About Palmonas',
    defaultOpen: true,
    blocks: [
      {
        type: 'paragraph',
        text: 'Welcome to Palmonas, where modern minimalism meets real-life wearability. We design Demifine® Jewellery that looks like luxury, feels like a second skin, and outlasts your longest days. Our pieces are made with 925 sterling silver, surgical-grade stainless steel, and finished with thick layers of rhodium, 18k gold vermeil, and 18k gold tone plating — so you never have to babysit your jewellery or wait for an occasion to wear it.',
      },
      {
        type: 'paragraph',
        text: "From office days to off-duty plans, from subtle to statement, we're here to make jewellery that works as hard as you do. Think of us as the quiet flex in your everyday look — waterproof, skin-safe, and made to show up every single day.",
      },
      {
        type: 'paragraph',
        text: 'At Palmonas, we don\u2019t think jewellery should be reserved for \u201cspecial occasions\u201d or kept in a box waiting for its moment. It should be something you throw on without thinking — and still feel put together every time.',
      },
      {
        type: 'paragraph',
        text: "Our pieces are made for real life — the kind where you're rushing out the door, jumping from work to dinner, or stuffing everything into one weekend bag. No overthinking. Just great-looking jewellery that shows up with you, wherever you're going.",
      },
      {
        type: 'paragraph',
        text: 'That\u2019s what sets us apart. Not too precious. Not too flashy. Just intentionally made, beautifully finished pieces that feel like you — on your best days and your busiest ones.',
      },
      {
        type: 'bullets',
        label: 'Our materials speak for themselves:',
        items: [
          'Long-lasting gold plated, rhodium, and gold tone plated jewellery that doesn\u2019t flake or fade',
          'Sparkling lab grown diamond jewellery with zero mining guilt',
          'Hypoallergenic, tarnish-resistant, and always sweatproof',
          'Designed for layering, gifting, stacking, or simply wearing solo',
        ],
      },
      {
        type: 'paragraph',
        text: 'This is what Demifine® is all about — not just how it looks, but how it performs.',
        italic: true,
      },
    ],
  },
  {
    id: 'shop-by-category',
    title: 'Shop by category',
    blocks: [
      {
        type: 'subsection',
        title: 'Necklaces That Do More Than Just Look Good',
        paragraphs: [
          'Our necklaces collection is where subtle shine meets versatile design. Whether it\u2019s a kurta kind of day or just jeans and a tee, our styles slip in without trying too hard.',
          'You\u2019ll find choker necklaces that sit perfectly, classic chains that add just the right touch, and diamond necklaces that shine without trying too hard. Looking for a touch of tradition? Our modern pearl necklace styles offer just enough softness without feeling dated.',
          'From daily layering to occasional standout pieces, these necklaces for women don\u2019t just complete your outfit — they boost it.',
        ],
      },
      {
        type: 'subsection',
        title: 'Chains That Keep It Clean and Confident',
        paragraphs: [
          'Whether you prefer bold links or barely-there shimmer, our gold plated chain options are made to last — no tarnish, no green skin, no stress.',
          'Our collection includes light, delicate gold chains for women perfect for everyday elegance, as well as thicker statement styles that work across Indian and Western outfits. We also offer sleek, understated gold chains for men built to feel timeless, not flashy. And if gold isn\u2019t your thing, our silver chains for women offer a cooler-toned, ultra-versatile alternative. These aren\u2019t accessories — they\u2019re essentials.',
        ],
      },
      {
        type: 'subsection',
        title: 'Earrings That You Can Sleep In',
        paragraphs: [
          'We get it — earrings that look great but irritate your ears? Hard pass. That\u2019s why we\u2019ve designed a range of gold earrings for women that are light on your lobes but heavy on polish.',
          'Our daily wear gold earrings are hypoallergenic and feather-light, with finishes that won\u2019t fade. From classic hoops to modern crawlers, each pair blends comfort with sophistication. If you\u2019re someone who wants impact without bulk, our female gold earrings strike the perfect balance between bold and minimal. Wear them to work. Or to bed. Or both.',
        ],
      },
      {
        type: 'subsection',
        title: 'Rings That Aren\u2019t Just for \u201cOccasions\u201d',
        paragraphs: [
          'Your hands do a lot — your rings should keep up. We craft gold rings for women that are refined yet functional, whether you\u2019re typing away, toasting friends, or texting your way through traffic.',
          'Looking for sparkle? Our diamond rings for women feature responsibly sourced lab grown diamond stones, set in sturdy, everyday-friendly designs. For males, our men\u2019s gold plated rings are minimal, masculine, and refreshingly wearable — nothing over-the-top, just good taste in ring form. Every piece stacks well. And stands alone just fine.',
        ],
      },
      {
        type: 'subsection',
        title: 'Bracelets That Go Beyond Accessory Status',
        paragraphs: [
          'Your wristwear should feel like part of your personality, not an afterthought. Our bracelets for women are crafted to be comfortable, durable, and actually meaningful.',
          'You\u2019ll find chain-link styles, delicate textures, and charm bracelets designed to reflect who you are — without falling apart in a month. If you\u2019re into solid, simple pieces, our gold bracelets for women are plated to perfection and engineered for real-life wear. And for the guys, our men\u2019s gold plated bracelet collection delivers confidence in subtle, stylish form — and makes thoughtful gifts for men that aren\u2019t socks or cologne. Not flashy. Just flawless.',
        ],
      },
      {
        type: 'subsection',
        title: 'Bangles That Are Built to Stay Beautiful',
        paragraphs: [
          'We\u2019ve taken the traditional bangle and made it stronger, sleeker, and more wearable. No jangly chaos here — just refined, intentional styling.',
          'Our gold plated bangles are lightweight enough for everyday wear, but bold enough to anchor your outfit. Whether you\u2019re heading to the office or a puja, these gold bangles for women work across occasions — and look just as good with jeans as they do with a silk saree. Add one. Or stack five. There are no rules here.',
        ],
      },
      {
        type: 'subsection',
        title: 'Mangalsutra, Modernised',
        paragraphs: [
          'Tradition meets subtlety in our take on the silver mangalsutra. Designed for daily wear, each piece feels modern, light, and versatile — not weighed down by ornate bulk.',
          'We also offer minimal gold mangalsutra with black beads styles that honour the symbol without overdoing it. These pieces sit close to the skin, layer well with your usual jewellery, and pair easily with Indian and fusion fits. Symbolic doesn\u2019t have to mean stuck in the past.',
        ],
      },
    ],
  },
  {
    id: 'what-makes-different',
    title: 'What makes Palmonas different',
    blocks: [
      {
        type: 'subsection',
        title: 'Crafted for Now',
        paragraphs: [
          "Palmonas creates jewellery you don't have to plan around — thoughtfully crafted to keep up with your changing needs, from Monday meetings to weekend getaways. If it doesn't hold up through showers, workouts, meetings, or naps — we don't make it. Each piece is tested for comfort, longevity, and versatility.",
        ],
      },
      {
        type: 'subsection',
        title: 'Thoughtful Materials',
        paragraphs: [
          "We're obsessed with quality. That means using 925 sterling silver, surgical-grade stainless steel, and thick rhodium, gold tones, or gold plated jewellery finishes, with sparkle from cubic zirconia, pearls, and manufactured diamonds. It's all in the details — which are built to last.",
        ],
      },
      {
        type: 'subsection',
        title: 'No Skin Drama',
        paragraphs: [
          'Nickel? Not here. Brass? Nope. Our jewellery is hypoallergenic, anti-tarnish, and kind to sensitive skin. Because no one should have to choose between shine and skin safety.',
        ],
      },
      {
        type: 'subsection',
        title: 'Designed for You',
        paragraphs: [
          'Palmonas is proudly co-designed by Shraddha Kapoor, making it a true Shraddha Kapoor brand — one that blends clean lines, minimal glam, and pieces that feel modern yet personal. Each drop is a reflection of style without effort — exactly how jewellery should feel.',
        ],
      },
      {
        type: 'subsection',
        title: 'Fashion Meets Function',
        paragraphs: [
          "Everything we create is intentional. From clasps that don't break to stones that don't fall out, this is jewellery that doesn't flake — literally or figuratively. This is what Demifine® stands for. Elevated design. Everyday function.",
        ],
      },
    ],
  },
  {
    id: 'gifting-sorted',
    title: 'Gifting, Sorted — Jewellery Worth Sharing (or Keeping)',
    blocks: [
      {
        type: 'paragraph',
        text: "Jewellery that actually gets worn? That's the kind worth gifting. Our pieces make perfect presents for birthdays, anniversaries, weddings, or just because — including those moments when you simply want to treat yourself to something meaningful. Choose from personalised pendants, layered necklaces for women, jewellery sets, charm bracelets, or timeless gold rings for women — all perfect gifts for girls who know what style means. No cheese. No clichés. Just good design, made meaningful.",
      },
    ],
  },
  {
    id: 'faq',
    title: 'Frequently asked questions',
    blocks: [
      {
        type: 'faq',
        items: [
          {
            question: 'What is Demifine® jewellery, exactly?',
            answer:
              'Demifine® jewellery sits right between fine and fashion — made with quality materials like 925 sterling silver, surgical-grade steel, and finished with rhodium plating, gold tones, or 18k gold plating, adorned with pearls, cubic zirconia, and lab grown diamonds, minus the heavy price tag. It\u2019s designed to be worn daily and last way longer than fast fashion pieces.',
          },
          {
            question: 'How long does gold plated jewellery actually last?',
            answer:
              'With proper care? Years. Palmonas uses thicker-than-average 18k gold tones or 18k gold vermeil over quality base metals, not cheap brass. If you avoid harsh chemicals and store it properly, your gold plated jewellery will keep its shine through regular wear.',
          },
          {
            question: 'Can I wear Palmonas jewellery in the shower?',
            answer:
              'Yes, most of it is waterproof. Our jewellery is made to handle daily wear — even a little water — but if you want to keep it looking its best, it\u2019s a good idea to take it off before showers, workouts, or anything with harsh soaps and perfumes.',
          },
          {
            question: 'Will Palmonas jewellery turn my skin green?',
            answer:
              'Nope. We don\u2019t use low-quality alloys like nickel or brass — just 925 sterling silver and surgical-grade stainless steel. That means no skin reactions and no green tint, even with all-day wear.',
          },
          {
            question: 'Is lab grown diamond real?',
            answer:
              "Not really! A lab grown diamond has the same physical, optical, and chemical properties as a natural mined diamond — it's just made in a lab, not dug out of the earth. It's a more ethical, sustainable, and often a more affordable alternative.",
          },
          {
            question: "What's the difference between cubic zirconia and lab grown diamonds?",
            answer:
              'Cubic zirconia is a diamond simulant — it looks like a diamond, but it\u2019s not carbon-based. It\u2019s lighter, more affordable, and still very sparkly. Lab grown diamonds are chemically identical to natural mined diamonds. We use both depending on the design — and always disclose which is used, on every product page.',
          },
          {
            question: 'Is gold plated jewellery worth it?',
            answer:
              'Absolutely — if it\u2019s made well. Cheap gold plating fades quickly because it\u2019s a thin layer over bad metal. Ours is thick 18k gold tone plating or 18k gold vermeil over real silver or steel. You get the luxe look and feel without paying for solid gold.',
          },
          {
            question: 'How do I take care of my Demifine® jewellery?',
            answer:
              'It\u2019s low maintenance, not no maintenance. Keep it away from strong chemicals, clean it gently with a soft cloth, and store it in a dry place. Every Palmonas piece comes with a care guide to help you extend its life.',
          },
          {
            question: 'Do you make jewellery for sensitive skin?',
            answer:
              'Yes. All of our pieces are hypoallergenic. That means no nickel, no brass, no weird mystery metals — just clean materials that won\u2019t irritate your skin.',
          },
          {
            question: 'Are Palmonas mangalsutras traditional or modern?',
            answer:
              'Both. Our silver mangalsutra and black beads gold mangalsutra designs are intentionally minimal, wearable, and modern — but still rooted in tradition. They\u2019re made to be worn every day, not just during ceremonies or weddings.',
          },
          {
            question: 'Can I gift Palmonas jewellery?',
            answer:
              'Yes — and it won\u2019t feel like a rushed gift either. Our packaging is sleek, and we offer options like necklace for women, gold rings, or bracelets for women that are versatile enough for birthdays, anniversaries, and everything in between — especially if you\u2019re scrambling for birthday gifts for your girlfriend that don\u2019t scream \u201clast-minute\u201d.',
          },
          {
            question: 'Can men wear Palmonas jewellery?',
            answer:
              'Definitely. Our collection includes gold chains for men, gold plated rings, and men\u2019s gold plated bracelets that are designed to be subtle, stylish, and made for all-day comfort.',
          },
          {
            question: 'How do I know which necklace or ring suits me best?',
            answer:
              "Look for jewellery that fits your lifestyle. If you're on the move, go for minimal chains and smaller settings. If you like to layer, pick choker necklaces, longer pendants, and stackable rings. Still unsure? Our bestsellers section is a good place to start.",
          },
          {
            question: 'Is buying jewellery online safe?',
            answer:
              'With Palmonas? Yes. We list all product specs clearly, show real photos, and back our quality with a warranty. We offer easy returns, responsive support, and no shady surprises at checkout.',
          },
          {
            question: 'Do you ship internationally?',
            answer:
              "Yes, we ship worldwide — with tracking and insurance. Whether you're in India or abroad, your jewellery will get to you, looking just as good as it does on screen.",
          },
        ],
      },
    ],
  },
];
