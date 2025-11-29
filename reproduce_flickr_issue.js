
const normalizeFlickrPhoto = (photo) => {
    // STRATEGY: Use variant-specific dimensions (post-EXIF rotation)
    // Fallback hierarchy: largest available → medium → o_dims → defaults
    let effectiveWidth = null;
    let effectiveHeight = null;

    // Helper to safely parse dimensions
    const parseDim = (val) => val ? parseInt(val, 10) : null;

    // Try largest available variant first (most reliable for orientation)
    if (photo.width_o && photo.height_o) {
        effectiveWidth = parseDim(photo.width_o);
        effectiveHeight = parseDim(photo.height_o);
    } else if (photo.width_k && photo.height_k) {
        effectiveWidth = parseDim(photo.width_k);
        effectiveHeight = parseDim(photo.height_k);
    } else if (photo.width_h && photo.height_h) {
        effectiveWidth = parseDim(photo.width_h);
        effectiveHeight = parseDim(photo.height_h);
    } else if (photo.width_b && photo.height_b) {
        effectiveWidth = parseDim(photo.width_b);
        effectiveHeight = parseDim(photo.height_b);
    } else if (photo.o_dims) {
        // Fallback to o_dims (may have EXIF rotation issues)
        const [w, h] = photo.o_dims.split('x').map(Number);
        effectiveWidth = w;
        effectiveHeight = h;
    }

    // 1024px Heuristic for Free Accounts (where original dims are missing)
    // If one dimension is exactly 1024 and the other is smaller, it's likely constrained by that dimension.
    if (effectiveWidth && effectiveHeight && !photo.width_o && !photo.height_o) {
        if (effectiveHeight === 1024 && effectiveWidth < 1024) {
            // Height constrained -> Portrait
            // No change needed to dims, but we can trust this is portrait
        } else if (effectiveWidth === 1024 && effectiveHeight < 1024) {
             // Width constrained -> Landscape
        }
    }

    return {
        id: photo.id,
        width: effectiveWidth || 1024,
        height: effectiveHeight || 768,
        isPortrait: (effectiveHeight || 768) > (effectiveWidth || 1024)
    };
}

// Test Cases
const testCases = [
    {
        name: "Free User - Landscape (1024x768) - String Input",
        input: {
            id: "1",
            url_b: "http://example.com/b.jpg",
            width_b: "1024",
            height_b: "768",
            // No original or large
        }
    },
    {
        name: "Free User - Portrait (768x1024) - String Input",
        input: {
            id: "2",
            url_b: "http://example.com/b.jpg",
            width_b: "768",
            height_b: "1024",
        }
    },
    {
        name: "Free User - Portrait Heuristic (768x1024)",
        input: {
            id: "3",
            url_b: "http://example.com/b.jpg",
            width_b: 768,
            height_b: 1024,
        }
    },
    {
        name: "Free User - Landscape Heuristic (1024x768)",
        input: {
            id: "4",
            url_b: "http://example.com/b.jpg",
            width_b: 1024,
            height_b: 768,
        }
    },
    {
        name: "Missing Dimensions - Fallback",
        input: {
            id: "5",
            url_b: "http://example.com/b.jpg",
            // No width/height props
        }
    },
    {
        name: "Only o_dims (Landscape)",
        input: {
            id: "6",
            o_dims: "4000x3000"
        }
    },
    {
        name: "Only o_dims (Portrait)",
        input: {
            id: "7",
            o_dims: "3000x4000"
        }
    },
    {
        name: "Conflicting o_dims and width_b (Rotation)",
        input: {
            id: "8",
            o_dims: "4000x3000", // Landscape sensor
            width_b: 768,        // Rotated to Portrait
            height_b: 1024
        }
    }
];

testCases.forEach(test => {
    const result = normalizeFlickrPhoto(test.input);
    console.log(`Test: ${test.name}`);
    console.log(`  Dims: ${result.width}x${result.height}`);
    console.log(`  IsPortrait: ${result.isPortrait}`);
    console.log('---');
});
