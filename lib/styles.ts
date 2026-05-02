export interface StyleType {
  id: string;
  name: string;
  description: string;
  promptSuffix: string;
}

export const STYLE_TYPES: StyleType[] = [
  {
    id: "90s-retro-cel",
    name: "90s Retro Cel Anime",
    description: "Hand-painted anime cel look with clean, confident ink outlines of varying weight. Authentic look with visible film grain and slight color bleed from analog video transfer.",
    promptSuffix: "in 90s retro cel anime style, hand-painted anime cel look, clean confident ink outlines, varying line weight, visible film grain, slight color bleed, analog video transfer aesthetic"
  },
  {
    id: "graphic-poster",
    name: "Graphic Poster Illustration",
    description: "Bold, reductive illustration stripping subjects to essential graphic forms while retaining emotional impact. Compositions are bold and immediate.",
    promptSuffix: "as a bold graphic poster illustration, reductive forms, essential graphic shapes, high emotional impact, bold and immediate composition, minimal detail"
  },
  {
    id: "loose-ink-editorial",
    name: "Loose Ink Editorial",
    description: "Gestural, confident ink drawing with selective color washes — supremely skilled mark-making that looks effortless. Primary lines in black or dark ink, varying from whisper-thin to bold.",
    promptSuffix: "loose ink editorial illustration, gestural confident ink drawing, selective color washes, effortless mark-making, variable ink line thickness, black and dark ink"
  },
  {
    id: "vintage-comic",
    name: "Vintage Comic Style",
    description: "Dynamic mid-century pulp comic illustration with thick outlines, heavy black inks, halftone dot shading, muted aged colors, and bold poster-like typography.",
    promptSuffix: "vintage mid-century pulp comic style, thick outlines, heavy black ink, halftone dot shading, muted aged colors, bold typography"
  },
  {
    id: "franco-belgian",
    name: "Franco-Belgian Comic",
    description: "Also called Bande Dessinée or Ligne Claire style illustration. Uniform-weight ink outlines with clean, precise line thickness. Flat areas of solid color.",
    promptSuffix: "Ligne Claire style, Bande Dessinée, Franco-Belgian comic illustration, uniform-weight ink outlines, precise line thickness, flat areas of solid color, clear readable composition"
  },
  {
    id: "caricature",
    name: "Caricature Drawing",
    description: "Wildly distorted proportions that amplify the subject's most distinctive features — oversized heads, exaggerated noses, chins, ears, or brows.",
    promptSuffix: "caricature drawing, wildly distorted proportions, exaggerated distinctive features, oversized head, comic extremes"
  },
  {
    id: "needle-felt",
    name: "Needle-Felt World",
    description: "Soft, handmade miniature world constructed entirely from dense needle-felted wool, with every surface covered in visible fuzzy fibers and matte textile texture.",
    promptSuffix: "needle-felted world, handmade miniature, dense wool construction, fuzzy fibers, matte textile texture, tactile soft surface"
  },
  {
    id: "claymation",
    name: "Claymation",
    description: "Hand-sculpted stop-motion style with rounded clay forms, slight surface imperfections, and miniature physical sets. Tactile, playful, and dimensional.",
    promptSuffix: "claymation style, hand-sculpted clay, rounded forms, surface imperfections, miniature physical set, stop-motion aesthetic, tactile and playful"
  },
  {
    id: "surreal-photomontage",
    name: "Surreal Photomontage",
    description: "Surreal photomontage with cut-paper collage layering, crisp photographic fragments, and impossible visual juxtapositions arranged in a clean graphic composition.",
    promptSuffix: "surreal photomontage, cut-paper collage, photographic fragments, impossible juxtapositions, clean graphic composition, dreamlike absurdity"
  },
  {
    id: "neo-memphis",
    name: "Neo-Memphis",
    description: "Bold, irreverent, maximalist graphic compositions remixing Memphis Group geometry with contemporary digital design sensibility. Clashing color combinations.",
    promptSuffix: "Neo-Memphis style, bold irreverent maximalist, Memphis Group geometry, contemporary digital design, clashing color combinations, geometric patterns"
  },
  {
    id: "supermarionation",
    name: "Supermarionation Puppet",
    description: "Articulated marionette puppets with glossy, lacquered skin surfaces in futuristic sci-fi miniature sets. Handcrafted quality and use of miniature scale practical effects.",
    promptSuffix: "Supermarionation style, articulated marionette puppet, glossy lacquered skin, sci-fi miniature set, handcrafted practical effects"
  },
  {
    id: "vaporwave",
    name: "Vaporwave / Retrowave",
    description: "Everything feels like a memory of the 1980s filtered through early internet aesthetics. Saturated cyan-magenta-violet palette. Chrome and glass reflective surfaces.",
    promptSuffix: "vaporwave retrowave aesthetic, 1980s internet style, saturated cyan-magenta-violet palette, chrome and glass, wireframe grid landscape, neon horizon"
  },
  {
    id: "baroque",
    name: "Baroque Chiaroscuro",
    description: "17th century art style using contrast, movement, exuberant detail, deep color, grandeur, and surprise. A single dramatic light source. Rich, saturated darks.",
    promptSuffix: "Baroque Chiaroscuro style, dramatic light source, high contrast, exuberant detail, deep color, grandeur, rich saturated darks, 17th century art"
  },
  {
    id: "ukiyo-e",
    name: "Ukiyo-e Prints",
    description: "Traditional Japanese woodblock print style featuring flat areas of color, bold outlines, elegant patterning, cropped compositions, and flowing linework.",
    promptSuffix: "Ukiyo-e Japanese woodblock print style, flat color areas, bold outlines, elegant patterning, cropped composition, flowing linework"
  },
  {
    id: "autochrome",
    name: "Autochrome-Lumière",
    description: "Early color photography process with a delicate, dreamlike palette, softened focus, gentle contrast, and a grainy mosaic texture.",
    promptSuffix: "Autochrome-Lumière style, early color photography, delicate dreamlike palette, softened focus, gentle contrast, grainy mosaic texture"
  },
  {
    id: "impressionism",
    name: "Impressionism",
    description: "Broken color applied in small, visible brushstrokes that blend optically at a distance. Light is the true subject.",
    promptSuffix: "Impressionist painting style, small visible brushstrokes, broken color, optical blending, focus on light and momentary atmosphere"
  },
  {
    id: "roman-fresco",
    name: "Roman Fresco",
    description: "Roman-era wall paintings, a fragment of antiquity preserved on plaster. Softly modeled figures, earth-based pigments, and weathered surface.",
    promptSuffix: "Roman fresco style, wall painting fragment, antiquity on plaster, earth-based pigments, weathered mineral softness, softly modeled figures"
  },
  {
    id: "american-realism",
    name: "American Realism",
    description: "Precise painting of ordinary American scenes elevated to quiet monumentality through composition, light, and stillness. Stark honesty.",
    promptSuffix: "American Realism style, precise painting, ordinary scenes, quiet monumentality, stark honesty, focus on light and stillness"
  }
];
