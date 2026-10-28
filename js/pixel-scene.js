/* Animated pixel-art scenes built from crisp, hand-drawn tiles. */
(() => {
  const canvas = document.getElementById("activityCanvas");
  const context = canvas.getContext("2d");
  context.imageSmoothingEnabled = false;
  context.scale(2, 2);

  const palette = {
    ink: "#182232",
    outline: "#28334a",
    skin: "#f0b99b",
    hair: "#26324b",
    eye: "#263d62",
    shirt: "#7899d5",
    pants: "#455474",
    light: "#f4d28a",
  };

  function rect(x, y, w, h, color) {
    context.fillStyle = color;
    context.fillRect(
      Math.round(x),
      Math.round(y),
      Math.round(w),
      Math.round(h),
    );
  }

  function line(x1, y1, x2, y2, color, width = 1) {
    context.strokeStyle = color;
    context.lineWidth = width;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
  }

  function colorsFor(location) {
    const iso = location?.iso || "";
    if (["THA", "IDN", "PHL", "MYS", "VNM", "KHM", "LKA"].includes(iso))
      return {
        sky: "#7da9a1",
        far: "#59797b",
        near: "#385462",
        neon: "#edb76d",
        plant: "#759b69",
        trim: "#bf9b70",
      };
    if (["JPN", "KOR", "CHN", "TWN"].includes(iso))
      return {
        sky: "#94a8bb",
        far: "#637492",
        near: "#414e70",
        neon: "#ffb774",
        plant: "#6c9879",
        trim: "#c5a18c",
      };
    if (["FRA", "DEU", "GBR", "ITA", "ESP", "NLD", "POL"].includes(iso))
      return {
        sky: "#91a8a8",
        far: "#778b84",
        near: "#4f6465",
        neon: "#f0c880",
        plant: "#74936e",
        trim: "#c49a74",
      };
    if (["NGA", "KEN", "GHA", "ZAF", "ETH", "EGY"].includes(iso))
      return {
        sky: "#d6a877",
        far: "#a77e5d",
        near: "#665755",
        neon: "#f1cd7a",
        plant: "#71905d",
        trim: "#c99057",
      };
    if (["USA", "CAN", "MEX", "BRA", "ARG", "CHL"].includes(iso))
      return {
        sky: "#88aaca",
        far: "#68859c",
        near: "#3f5d77",
        neon: "#f4c275",
        plant: "#769873",
        trim: "#b99471",
      };
    return {
      sky: "#93aab0",
      far: "#6c8285",
      near: "#465a69",
      neon: "#eec47c",
      plant: "#7d9971",
      trim: "#bfa27b",
    };
  }

  function drawSkyline(location, hour, colors, seed) {
    const night = hour < 6 || hour >= 19;
    const evening = hour >= 17 && hour < 20;
    const sky = night ? "#202b4b" : evening ? "#c27f79" : colors.sky;
    rect(0, 0, 480, 200, sky);
    rect(0, 107, 480, 45, night ? "#344363" : colors.far);
    rect(0, 136, 480, 45, night ? "#27364f" : colors.near);
    if (night) {
      for (let i = 0; i < 34; i++) {
        const x = (i * 61 + seed * 3) % 470;
        const y = 12 + ((i * 23 + seed) % 72);
        rect(
          x,
          y,
          i % 4 === 0 ? 2 : 1,
          i % 4 === 0 ? 2 : 1,
          i % 3 ? "#f4dcac" : "#bdcde0",
        );
      }
      rect(408, 28, 19, 19, "#f2ddb0");
      rect(413, 24, 18, 19, sky);
    } else {
      rect(390, 22, 24, 24, "#f8d894");
      rect(384, 29, 4, 11, "#f8d894");
      rect(416, 29, 4, 11, "#f8d894");
      const cloud = (seed * 7 + Math.floor(hour / 3) * 28) % 430;
      rect(cloud, 48, 41, 6, "#d1e2df");
      rect(cloud + 8, 41, 27, 7, "#d1e2df");
      rect(cloud + 31, 47, 20, 5, "#d1e2df");
    }

    for (let i = 0; i < 12; i++) {
      const x = i * 42 - 7;
      const bw = 25 + ((seed + i * 13) % 15);
      const bh = 32 + ((seed * (i + 5)) % 58);
      const y = 150 - bh;
      const base = i % 2 ? colors.near : colors.far;
      rect(x, y, bw, bh, base);
      rect(x - 2, y, bw + 4, 4, night ? "#52617d" : colors.trim);
      if (location?.iso === "JPN" || location?.iso === "KOR") {
        rect(x + 5, y - 8, 4, 8, base);
        rect(x + 14, y - 13, 4, 13, base);
      } else if (["FRA", "ITA", "ESP"].includes(location?.iso)) {
        rect(x + 3, y - 5, bw - 6, 6, base);
        rect(x + 8, y - 12, 3, 10, base);
      }
      for (let wy = y + 9; wy < 145; wy += 13) {
        for (let wx = x + 5; wx < x + bw - 2; wx += 9) {
          rect(
            wx,
            wy,
            3,
            5,
            night ? (wx % 3 ? "#f4c987" : "#65718a") : "#bfd0c0",
          );
        }
      }
    }
    rect(0, 151, 480, 4, night ? "#192339" : "#394a58");
  }

  function drawWindow(location, hour, colors, seed) {
    rect(21, 20, 258, 130, "#24324a");
    rect(27, 26, 246, 118, "#dec7a4");
    context.save();
    context.beginPath();
    context.rect(33, 32, 234, 106);
    context.clip();
    drawSkyline(location, hour, colors, seed);
    context.restore();
    rect(145, 26, 7, 118, "#5b5260");
    rect(28, 83, 244, 7, "#5b5260");
    rect(18, 145, 266, 8, "#efe0b9");
    rect(24, 153, 254, 4, "#aa876f");
  }

  function drawIndoorBackground(kind, location, hour, colors, seed) {
    const wall =
      kind === "study" ? "#d8d6c3" : kind === "work" ? "#bfc8c7" : "#b4b7a8";
    rect(0, 0, 480, 200, wall);
    rect(0, 0, 480, 12, "#eee6cf");
    for (let x = 6; x < 480; x += 32)
      rect(x, 12, 1, 134, kind === "study" ? "#cfccbb" : "#abb5ae");
    drawWindow(location, hour, colors, seed);
    if (kind === "study") {
      rect(307, 29, 145, 61, "#514657");
      rect(313, 34, 133, 49, "#455c63");
      rect(325, 44, 87, 4, "#d2d0a8");
      rect(325, 57, 100, 3, "#b9c6ad");
      rect(325, 69, 69, 3, "#d2d0a8");
      rect(350, 106, 115, 8, "#987b61");
      rect(358, 114, 8, 32, "#6b5a54");
      rect(449, 114, 8, 32, "#6b5a54");
      rect(374, 91, 40, 13, "#e8d9ad");
      rect(379, 86, 30, 7, "#7190a2");
      rect(29, 115, 65, 30, "#7d987e");
      rect(38, 105, 46, 10, "#91a88b");
    } else if (kind === "work") {
      rect(321, 29, 145, 66, "#7c8c8b");
      rect(327, 35, 133, 54, "#cad2c5");
      for (let i = 0; i < 6; i++) {
        rect(338 + i * 19, 45, 12, 39, i % 2 ? "#759092" : "#94a49a");
        rect(341 + i * 19, 52, 3, 5, "#f0d18e");
        rect(347 + i * 19, 63, 3, 5, "#f0d18e");
      }
      rect(35, 104, 68, 42, "#778f76");
      rect(42, 93, 53, 12, "#91a880");
      rect(58, 122, 21, 24, "#a07f61");
    } else {
      rect(321, 31, 132, 5, "#8d715f");
      rect(335, 40, 49, 23, "#e5d6b6");
      rect(389, 40, 50, 23, "#c78479");
      rect(321, 67, 132, 4, "#8d715f");
      rect(331, 75, 29, 20, "#6f8c82");
      rect(367, 75, 36, 20, "#c2ab7e");
      rect(411, 75, 31, 20, "#7a899c");
      rect(30, 82, 49, 16, "#d3b77c");
      rect(36, 74, 37, 9, "#e2c98d");
    }
  }

  function drawOutside(kind, location, hour, colors, seed) {
    drawSkyline(location, hour, colors, seed);
    rect(0, 154, 480, 46, "#756c68");
    rect(0, 154, 480, 5, "#c6ac83");
    rect(0, 172, 480, 28, "#485161");
    rect(0, 172, 480, 3, "#d0b57e");
    for (let x = 13; x < 480; x += 82) rect(x, 185, 32, 3, "#eee0b7");
    const shopColor = kind === "travel" ? "#bd766a" : "#728d86";
    rect(26, 93, 102, 61, "#ead6b3");
    rect(20, 87, 114, 12, shopColor);
    for (let x = 23; x < 132; x += 18)
      rect(x, 87, 9, 13, x % 2 ? "#efe0bd" : shopColor);
    rect(42, 109, 29, 45, "#668593");
    rect(79, 107, 38, 47, "#829b92");
    rect(47, 114, 19, 26, "#bad0c4");
    rect(85, 112, 25, 28, "#d3d5bb");
    rect(30, 61, 8, 35, "#5d5360");
    rect(16, 59, 37, 7, colors.neon);
    rect(24, 67, 21, 3, "#fff0c9");
    rect(390, 135, 11, 29, "#705444");
    rect(377, 117, 39, 24, colors.plant);
    rect(371, 127, 15, 13, colors.plant);
    rect(404, 111, 18, 29, colors.plant);
    if (kind === "commute") {
      rect(153, 141, 132, 28, "#e0bb75");
      rect(162, 132, 111, 13, "#edd497");
      rect(171, 150, 24, 13, "#68818e");
      rect(207, 150, 24, 13, "#68818e");
      rect(246, 150, 25, 13, "#68818e");
      rect(177, 170, 22, 10, "#30394a");
      rect(249, 170, 22, 10, "#30394a");
    }
  }

  function drawDesk(kind, colors, hour) {
    if (kind === "study") {
      rect(69, 152, 339, 13, "#976c50");
      rect(85, 164, 12, 34, "#67544b");
      rect(385, 164, 12, 34, "#67544b");
      rect(104, 134, 56, 8, "#e7d5a5");
      rect(111, 126, 43, 8, "#7e9eaf");
      rect(115, 121, 35, 5, "#c98273");
      rect(279, 141, 60, 10, "#d7bd83");
      rect(291, 128, 37, 13, "#607d8c");
      return { x: 214, y: 158, seated: true };
    }
    if (kind === "work") {
      rect(74, 150, 348, 14, "#705c58");
      rect(92, 163, 13, 35, "#4e4a55");
      rect(393, 163, 13, 35, "#4e4a55");
      rect(118, 120, 60, 29, "#37465a");
      rect(123, 125, 50, 18, hour > 19 ? "#90a1c4" : "#93b9b2");
      rect(202, 141, 31, 9, "#e0ceaa");
      rect(287, 134, 28, 14, "#bd8c69");
      rect(333, 137, 31, 11, "#b9c5b4");
      return { x: 238, y: 159, seated: true };
    }
    rect(287, 135, 112, 14, "#a17b60");
    rect(302, 149, 11, 34, "#6b594f");
    rect(375, 149, 11, 34, "#6b594f");
    rect(296, 123, 41, 11, "#e7d6b5");
    rect(338, 127, 31, 7, "#778d95");
    rect(198, 147, 62, 9, "#826c60");
    rect(207, 136, 47, 14, "#c8a993");
    rect(194, 154, 10, 25, "#625551");
    rect(254, 154, 10, 25, "#625551");
    rect(41, 142, 29, 35, "#956b54");
    rect(35, 139, 41, 8, "#c3976e");
    rect(39, 128, 19, 12, colors.plant);
    rect(58, 120, 14, 20, colors.plant);
    return { x: 242, y: 157, seated: false };
  }

  function drawAnimeCharacter(x, floor, state, frame) {
    const { kind } = state.activity;
    const look = state.character || {};
    const step = kind === "commute" || kind === "travel" ? (frame ? 3 : -2) : 0;
    const body =
      look.shirt ||
      (kind === "study" ? "#739ad1" : kind === "work" ? "#60798e" : "#7b9ad0");
    const hair =
      look.hair ||
      (state.age < 24 ? "#334263" : state.age < 50 ? "#443852" : "#77705d");
    const skin = look.skin || palette.skin;
    const jacket = kind === "commute" ? "#c17b67" : body;
    const seated = state.seated;
    rect(x - 21, floor + 1, 44, 4, "#403f4b");

    // Shoes, legs, and jacket use one-pixel outlines to read like a small game sprite.
    rect(x - 12, floor - 18 + step, 10, 18, "#34415b");
    rect(x + 2, floor - 18 - step, 10, 18, "#34415b");
    rect(x - 15, floor - 3 + step, 15, 5, "#242c42");
    rect(x + 1, floor - 3 - step, 16, 5, "#242c42");
    rect(x - 15, floor - 44, 31, 28, palette.outline);
    rect(x - 12, floor - 42, 25, 24, jacket);
    rect(x - 2, floor - 41, 3, 21, kind === "study" ? "#d6e2d0" : "#efd09a");
    rect(x - 17, floor - 42, 7, 20, palette.outline);
    rect(x - 19, floor - 38 + (frame ? 1 : 0), 6, 17, skin);
    rect(x + 11, floor - 40 + (frame ? -1 : 1), 7, 17, skin);
    rect(x - 14, floor - 69, 28, 27, palette.outline);
    rect(x - 12, floor - 67, 24, 23, skin);

    // Anime fringe, side locks, bright eyes, and blush details.
    rect(x - 15, floor - 75, 31, 17, palette.outline);
    rect(x - 12, floor - 74, 26, 13, hair);
    rect(x - 15, floor - 70, 7, 18, hair);
    rect(x + 9, floor - 71, 7, 21, hair);
    if (look.hairstyle === 1) {
      rect(x - 17, floor - 58, 7, 24, hair);
      rect(x + 12, floor - 58, 7, 27, hair);
      rect(x - 9, floor - 78, 17, 5, hair);
    } else if (look.hairstyle === 2) {
      rect(x - 19, floor - 75, 7, 8, hair);
      rect(x + 12, floor - 76, 8, 9, hair);
      rect(x + 14, floor - 65, 5, 24, hair);
    } else if (look.hairstyle === 3) {
      rect(x - 18, floor - 78, 8, 8, hair);
      rect(x + 10, floor - 78, 8, 8, hair);
      rect(x - 8, floor - 77, 16, 6, hair);
    }
    rect(x - 8, floor - 74, 7, 4, "#7785ab");
    rect(x + 1, floor - 73, 8, 4, "#7785ab");
    rect(x - 7, floor - 60, 5, 5, "#fff0c7");
    rect(x + 4, floor - 60, 5, 5, "#fff0c7");
    rect(x - 6, floor - 60, 3, 4, palette.eye);
    rect(x + 5, floor - 60, 3, 4, palette.eye);
    rect(x - 10, floor - 52, 4, 2, "#e89691");
    rect(x + 7, floor - 52, 4, 2, "#e89691");
    rect(x - 1, floor - 50, 3, 2, "#a65f63");
    if (look.accessory === "glasses") {
      rect(x - 9, floor - 62, 10, 7, "#d9d4c5");
      rect(x + 2, floor - 62, 10, 7, "#d9d4c5");
      rect(x - 7, floor - 60, 6, 3, "#43566b");
      rect(x + 4, floor - 60, 6, 3, "#43566b");
      rect(x, floor - 60, 3, 1, "#e7d8b7");
    }

    if (kind === "commute") {
      rect(x + 13, floor - 43, 14, 22, "#d4a86d");
      rect(x + 16, floor - 41, 9, 3, "#f0d493");
    }
    if (kind === "study") {
      rect(x + 15, floor - 26, 9, 7, "#eee0b8");
      rect(x + 17, floor - 25, 5, 1, "#7894a5");
    }
    if (kind === "rest" && !seated) {
      rect(x - 7, floor - 3, 21, 3, "#d9b6a4");
    }
  }

  function draw(timestamp, state) {
    const location = state.location;
    const activity = state.activity;
    const colors = colorsFor(location);
    const seed = (location?.iso || "world")
      .split("")
      .reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
    const hour = Math.floor((state.clockMinutes || 0) / 60);
    const kind = activity.kind;
    if (["commute", "travel", "shop", "exercise"].includes(kind)) {
      drawOutside(kind, location, hour, colors, seed);
      drawAnimeCharacter(
        kind === "commute" ? 218 : 245,
        169,
        state,
        Math.floor(timestamp / 240) % 2,
      );
      if (kind === "travel") {
        rect(357, 131, 69, 24, "#f0d6a2");
        rect(367, 137, 48, 4, "#758ba0");
        rect(369, 145, 21, 6, "#9ab8ac");
        rect(394, 145, 20, 6, "#d08d75");
      }
    } else {
      drawIndoorBackground(kind, location, hour, colors, seed);
      rect(0, 155, 480, 45, "#806b60");
      rect(0, 155, 480, 4, "#d1b98e");
      for (let y = 169; y < 200; y += 14) {
        rect(0, y, 480, 1, "#695a57");
        for (let x = (y % 3) * 18; x < 480; x += 78)
          rect(x, y - 8, 1, 8, "#a18370");
      }
      if (kind === "study" || kind === "work") {
        const chair = kind === "study" ? "#607c93" : "#4d596b";
        rect(201, 143, 70, 14, chair);
        rect(206, 157, 7, 23, "#445265");
        rect(259, 157, 7, 23, "#445265");
      }
      const avatar = drawDesk(kind, colors, hour);
      drawAnimeCharacter(
        avatar.x,
        avatar.y,
        { ...state, seated: avatar.seated },
        Math.floor(timestamp / 320) % 2,
      );
      if (state.family?.partner && ["family", "cook", "care"].includes(kind)) {
        rect(396, 146, 14, 5, "#403f4b");
        rect(398, 126, 11, 19, "#b86f76");
        rect(397, 113, 13, 15, "#f0c1a1");
        rect(396, 109, 15, 8, "#483b51");
      }
    }
    // Foreground highlights make the scene feel like a framed anime game cutaway.
    rect(0, 0, 480, 3, "#202b3d");
    rect(0, 197, 480, 3, "#202b3d");
  }

  window.LifeScene = Object.freeze({ draw });
})();
