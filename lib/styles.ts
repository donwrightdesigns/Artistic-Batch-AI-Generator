export interface StyleType {
  id: string;
  name: string;
  description: string;
  promptSuffix: string;
  thumbnail: string;
}

export const STYLE_TYPES: StyleType[] = [
  {
    id: "90s-retro-cel",
    name: "Retro Cel Anime",
    description: "Hand-painted anime cel look with clean, confident ink outlines of varying weight. Authentic look with visible film grain and slight color bleed from analog video transfer.",
    promptSuffix: "in 90s retro cel anime style, hand-painted anime cel look, clean confident ink outlines, varying line weight, visible film grain, slight color bleed, analog video transfer aesthetic",
    thumbnail: "/images/style_90s_retro_cel_1777683195869.png"
  },
  {
    id: "pascal-campion",
    name: "Pascal Campion",
    description: "Atmospheric digital painting featuring high-contrast rim lighting and blocky, painterly shapes. Characterized by silhouette-heavy compositions and textured, unblended digital brushwork.",
    promptSuffix: "in the style of Pascal Campion, dramatic backlighting, glowing rim light, blocky reductive shapes, silhouette-driven composition, unblended digital brushstrokes, flat color masses, textured paint dabs, cinematic depth, sharp-edged light beams, gritty digital grain",
    thumbnail: "/images/style_pascal_campion_1777683218484.png"
  },
  {
    id: "graphic-poster",
    name: "Graphic Poster",
    description: "Bold, reductive illustration stripping subjects to essential graphic forms while retaining emotional impact. Compositions are bold and immediate.",
    promptSuffix: "as a bold graphic poster illustration, reductive forms, essential graphic shapes, high emotional impact, bold and immediate composition, minimal detail",
    thumbnail: "/images/style_graphic_poster_1777683232888.png"
  },
  {
    id: "loose-ink-editorial",
    name: "Ink Editorial",
    description: "Gestural, confident ink drawing with selective color washes — supremely skilled mark-making that looks effortless. Primary lines in black or dark ink, varying from whisper-thin to bold.",
    promptSuffix: "loose ink editorial illustration, gestural confident ink drawing, selective color washes, effortless mark-making, variable ink line thickness, black and dark ink",
    thumbnail: "/images/style_loose_ink_editorial_1777683247987.png"
  },
  {
    id: "vintage-comic",
    name: "Vintage Comic",
    description: "Dynamic mid-century pulp comic illustration with thick outlines, heavy black inks, halftone dot shading, muted aged colors, and bold poster-like typography.",
    promptSuffix: "vintage mid-century pulp comic style, thick outlines, heavy black ink, halftone dot shading, muted aged colors, bold typography",
    thumbnail: "/images/style_vintage_comic_style_1777683263505.png"
  },
  {
    id: "franco-belgian",
    name: "Belgian Comic",
    description: "Also called Bande Dessinée or Ligne Claire style illustration. Uniform-weight ink outlines with clean, precise line thickness. Flat areas of solid color.",
    promptSuffix: "Ligne Claire style, Bande Dessinée, Franco-Belgian comic illustration, uniform-weight ink outlines, precise line thickness, flat areas of solid color, clear readable composition",
    thumbnail: "/images/style_franco_belgian_comic_1777683279800.png"
  },
  {
    id: "caricature1",
    name: "Caricature Gilray",
    description: "distorted proportions that amplify the subject's most distinctive features — oversized heads, exaggerated noses, chins, ears, or brows.",
    promptSuffix: "Artwork in style of James Gillray extremely specific to the subject, distorted proportions, exaggerate their unique features, oversized head. ",
    thumbnail: "/images/style_caricature_gilray_1777683294989.png"
  },
  {
    id: "needle-felt",
    name: "Needle-Felt",
    description: "Soft, handmade miniature world constructed entirely from dense needle-felted wool, with every surface covered in visible fuzzy fibers and matte textile texture.",
    promptSuffix: "needle-felted world, handmade miniature, dense wool construction, fuzzy fibers, matte textile texture, tactile soft surface",
    thumbnail: "/images/style_needle_felt_world_1777683307990.png"
  },
  {
    id: "pixar-gumby",
    name: "Pixar Character",
    description: "subtle caricature in an oil pastel style with Pixar cues, ore 3d rendering & light tracing (video game character style)",
    promptSuffix: "subtle caricature in an oil pastel style with Pixar cues, ore 3d rendering & light tracing (video game character style).",
    thumbnail: "/images/style_pixar_character_1777691067034.png"
  },
  {
    id: "neo-memphis",
    name: "Neo-Memphis",
    description: "Bold, irreverent, maximalist graphic compositions remixing Memphis Group geometry with contemporary digital design sensibility. Clashing color combinations.",
    promptSuffix: "Neo-Memphis style, bold irreverent maximalist, Memphis Group geometry, contemporary digital design, clashing color combinations, geometric patterns",
    thumbnail: "/images/style_neo_memphis_1777691082649.png"
  },
  {
    id: "supermarionation",
    name: "Supermarionation",
    description: "Articulated marionette puppets with glossy, lacquered skin surfaces in futuristic sci-fi miniature sets. Handcrafted quality and use of miniature scale practical effects.",
    promptSuffix: "Supermarionation style, articulated marionette puppet, glossy lacquered skin, sci-fi miniature set, handcrafted practical effects",
    thumbnail: "/images/style_supermarionation_1777691097473.png"
  },
  {
    id: "baroque",
    name: "Baroque",
    description: "17th century art style using contrast, movement, exuberant detail, deep color, grandeur, and surprise. A single dramatic light source. Rich, saturated darks.",
    promptSuffix: "Baroque Chiaroscuro style, dramatic light source, high contrast, exuberant detail, deep color, grandeur, rich saturated darks, 17th century art",
    thumbnail: "/images/style_baroque_1777691110468.png"
  },
  {
    id: "ukiyo-e",
    name: "Ukiyo-e",
    description: "Traditional Japanese woodblock print style featuring flat areas of color, bold outlines, elegant patterning, cropped compositions, and flowing linework.",
    promptSuffix: "Ukiyo-e Japanese woodblock print style, flat color areas, bold outlines, elegant patterning, cropped composition, flowing linework",
    thumbnail: "/images/style_ukiyo_e_1777691124140.png"
  },
  {
    id: "impressionism",
    name: "Impressionism",
    description: "Broken color applied in small, visible brushstrokes that blend optically at a distance. Light is the true subject.",
    promptSuffix: "Impressionist painting style, small visible brushstrokes, broken color, optical blending, focus on light and momentary atmosphere",
    thumbnail: "/images/style_impressionism_1777691138038.png"
  },
  {
    id: "roman-fresco",
    name: "Roman Fresco",
    description: "Roman-era wall paintings, a fragment of antiquity preserved on plaster. Softly modeled figures, earth-based pigments, and weathered surface.",
    promptSuffix: "Roman fresco style, wall painting fragment, antiquity on plaster, earth-based pigments, weathered mineral softness, softly modeled figures",
    thumbnail: "/images/style_roman_fresco_1777691153717.png"
  },
  {
    id: "norman-rockwell",
    name: "Norman Rockwell",
    description: "Norman Rockwell style painting",
    promptSuffix: "In the timeless style of Norman Rockwell.",
    thumbnail: "/images/style_norman_rockwell_1777691170482.png"
  },
  {
    id: "cinemagram",
    name: "Cinemagram",
    description: "Living photo aesthetic featuring high-contrast subjects with shallow depth of field and atmospheric environmental motion cues. Cinematic color grading with an emphasis on 'frozen time'.",
    promptSuffix: "Cinemagram living photo style, cinematic lighting, shallow depth of field, high contrast, focused subject, blurred atmospheric background, frozen motion, rich deep blacks, moody professional photography aesthetic",
    thumbnail: "https://picsum.photos/seed/cinemagram/400/400"
  },
];
