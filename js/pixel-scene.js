/* Animated pixel-art scenes built from crisp, hand-drawn tiles. */
(() => {
  const canvas = document.getElementById("activityCanvas");
  const context = canvas.getContext("2d");
  context.imageSmoothingEnabled = false;
  context.scale(3, 3);

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
  const villageLayers = [
    "mountains.png",
    "meadow.png",
    "tree.png",
    "cottage.png",
  ].map((name) => {
    const image = new Image();
    image.src = window.LIFE_SIM_VILLAGE_IMAGES?.[name] || `assets/village/${name}`;
    return image;
  });

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
        sky: "#72c2c4",
        far: "#548f9b",
        near: "#315c78",
        neon: "#ffbb62",
        plant: "#62a66f",
        trim: "#e8a277",
      };
    if (["JPN", "KOR", "CHN", "TWN"].includes(iso))
      return {
        sky: "#8cc7e2",
        far: "#5e81ab",
        near: "#354d7b",
        neon: "#ff9e79",
        plant: "#63a77b",
        trim: "#f0a77e",
      };
    if (["FRA", "DEU", "GBR", "ITA", "ESP", "NLD", "POL"].includes(iso))
      return {
        sky: "#a9cfe0",
        far: "#7897a2",
        near: "#4a677f",
        neon: "#f5bf6e",
        plant: "#70a276",
        trim: "#e5a779",
      };
    if (["NGA", "KEN", "GHA", "ZAF", "ETH", "EGY"].includes(iso))
      return {
        sky: "#f0b778",
        far: "#c98262",
        near: "#79566a",
        neon: "#ffe082",
        plant: "#78a85e",
        trim: "#e6a25e",
      };
    if (["USA", "CAN", "MEX", "BRA", "ARG", "CHL"].includes(iso))
      return {
        sky: "#93c9ee",
        far: "#6c9db7",
        near: "#3f6185",
        neon: "#ffd080",
        plant: "#7aac71",
        trim: "#e8a877",
      };
    return {
      sky: "#a1d3dd",
      far: "#6c9aa2",
      near: "#456a82",
      neon: "#eec47c",
      plant: "#7d9971",
      trim: "#d9a477",
    };
  }

  function drawSkyline(location, hour, colors, seed) {
    if (location?.iso === "THA") {
      drawThaiLocation(location, hour, colors, seed, 0, true);
      return;
    }
    const night = hour < 6 || hour >= 19;
    const evening = hour >= 17 && hour < 20;
    const sky = night ? "#202b4b" : evening ? "#c27f79" : colors.sky;
    rect(0, 0, 480, 200, sky);
    rect(0, 107, 480, 45, night ? "#344363" : colors.far);
    rect(0, 136, 480, 45, night ? "#27364f" : colors.near);
    if (night) {
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

  function drawThaiLocation(location, hour, colors, seed, season, urban) {
    const night = hour < 6 || hour >= 19;
    const dusk = hour >= 17 && hour < 20;
    const sky = night ? "#263451" : dusk ? "#d48670" : "#83c6d5";
    const city = location?.city || "กรุงเทพฯ";
    rect(0, 0, 480, 200, sky);
    rect(0, 39, 480, 5, "#dce9e5");
    rect(19, 31, 59, 8, "#dce9e5");
    rect(295, 49, 68, 6, "#dce9e5");
    rect(308, 42, 38, 8, "#dce9e5");
    if (night) rect(413, 20, 15, 15, "#f4e8be");
    else rect(410, 18, 23, 23, "#ffe39b");

    const north = city === "เชียงใหม่" || city === "อุดรธานี";
    const south = city === "ภูเก็ต";
    rect(0, 99, 480, 26, north ? "#789b8f" : south ? "#75aaa9" : "#739987");
    rect(0, 117, 480, 34, "#58866d");
    if (north) {
      rect(0, 78, 104, 26, "#607f87");
      rect(34, 67, 76, 18, "#607f87");
      rect(365, 79, 115, 24, "#607f87");
      rect(393, 65, 87, 16, "#607f87");
    }
    if (south) {
      rect(0, 105, 480, 18, "#67aeb2");
      rect(0, 122, 480, 26, "#3d8294");
      for (let x = 0; x < 480; x += 37) rect(x, 130 + (x % 3) * 3, 24, 2, "#b6d8c3");
    }

    if (urban) {
      for (let i = 0; i < 11; i++) {
        const x = i * 46 - 6;
        const height = 32 + ((seed + i * 17) % 57);
        const y = 145 - height;
        rect(x, y, 32, height, i % 2 ? "#516d81" : "#637f8e");
        rect(x - 2, y, 36, 4, "#e3ad75");
        for (let wy = y + 9; wy < 140; wy += 13) {
          rect(x + 6, wy, 4, 5, night ? "#f2c77d" : "#d6e2ce");
          rect(x + 19, wy, 4, 5, night ? "#e9ba72" : "#d6e2ce");
        }
      }
      if (city === "กรุงเทพฯ") {
        rect(208, 72, 58, 75, "#d5b77f");
        rect(215, 64, 44, 9, "#a46e59");
        rect(221, 55, 31, 10, "#e5ca8f");
        rect(230, 44, 13, 12, "#bf8f61");
        rect(235, 35, 4, 10, "#f2dcaa");
        rect(190, 144, 95, 4, "#e9d5a4");
      } else if (city === "เชียงใหม่") {
        rect(208, 99, 68, 48, "#dfbf7c");
        rect(201, 90, 82, 10, "#b77750");
        rect(215, 81, 54, 10, "#d8b16e");
        rect(224, 72, 36, 9, "#b77750");
        rect(232, 59, 19, 13, "#e4c77f");
        rect(239, 49, 5, 10, "#f1db9d");
      } else if (south) {
        rect(0, 142, 480, 58, "#d6b77d");
      }
      rect(0, 150, 480, 50, "#454f5a");
      rect(0, 151, 480, 4, "#d6bd87");
      rect(39, 135, 87, 13, "#a96e4e");
      rect(48, 129, 63, 8, "#e5bd72");
      rect(59, 148, 5, 12, "#363f4b");
      rect(102, 148, 5, 12, "#363f4b");
      rect(43, 140, 27, 4, "#f4dfaa");
      rect(75, 138, 26, 4, "#f4dfaa");
    } else {
      const field = season === 2 ? "#b0a64f" : season === 3 ? "#8aa16d" : "#77a855";
      rect(0, 130, 480, 70, field);
      rect(0, 147, 480, 5, "#6c9d4e");
      rect(0, 170, 480, 5, "#6c9d4e");
      rect(0, 190, 480, 4, "#6c9d4e");
      for (let x = 0; x < 480; x += 29) {
        rect(x + (seed % 11), 137, 2, 24, "#c4cf79");
        rect(x + 9, 159, 2, 25, "#d9d586");
      }
      rect(52, 80, 7, 64, "#76513d");
      rect(29, 78, 51, 8, "#76513d");
      rect(23, 71, 60, 8, "#4f7f54");
      rect(26, 63, 48, 9, "#5f925b");
      rect(36, 55, 37, 9, "#6a9f61");
      // Thai timber house on stilts, with a layered gable roof and shaded porch.
      rect(197, 88, 151, 49, "#c89158");
      rect(186, 81, 174, 11, "#774c46");
      rect(206, 71, 132, 11, "#a9634f");
      rect(223, 62, 100, 9, "#774c46");
      rect(239, 55, 69, 8, "#a9634f");
      rect(218, 97, 8, 40, "#815640");
      rect(320, 97, 8, 40, "#815640");
      rect(230, 101, 37, 25, "#5d8288");
      rect(235, 106, 26, 19, night ? "#f4ca83" : "#a8d4cc");
      rect(280, 101, 42, 36, "#8e5e47");
      rect(286, 107, 29, 30, "#bd8658");
      rect(174, 133, 195, 7, "#d8aa69");
      rect(185, 140, 8, 20, "#815640");
      rect(349, 140, 8, 20, "#815640");
      rect(106, 125, 7, 29, "#815640");
      rect(85, 119, 49, 7, "#815640");
      rect(89, 110, 39, 11, "#77a563");
      rect(92, 102, 31, 10, "#6a955d");
      rect(402, 128, 6, 30, "#76503e");
      rect(392, 105, 27, 24, "#538450");
      rect(384, 94, 37, 17, "#60935a");
      rect(397, 84, 23, 13, "#6da262");
    }
    if (night || dusk) {
      context.fillStyle = night ? "rgba(25, 33, 58, .30)" : "rgba(190, 100, 83, .14)";
      context.fillRect(0, 0, 480, 200);
    }
  }

  function drawCozyVillage(location, hour, colors, seed, season = 0, urban = false) {
    if (location?.iso === "THA") {
      drawThaiLocation(location, hour, colors, seed, season, urban);
      return;
    }
    const night = hour < 6 || hour >= 19;
    const evening = hour >= 17 && hour < 20;
    if (villageLayers.every((image) => image.complete && image.naturalWidth)) {
      for (const layer of villageLayers) {
        context.drawImage(layer, 0, 0, 576, 240, 0, 0, 480, 200);
      }
      if (night || evening) {
        context.fillStyle = night ? "rgba(25, 34, 57, 0.43)" : "rgba(208, 113, 79, 0.16)";
        context.fillRect(0, 0, 480, 200);
      }
      if (season === 3) {
        context.fillStyle = "rgba(221, 234, 240, 0.24)";
        context.fillRect(0, 151, 480, 49);
      }
      if (!night) {
        rect(429, 20, 15, 15, "#ffe6a3");
        rect(426, 24, 2, 7, "#ffe6a3");
        rect(445, 24, 2, 7, "#ffe6a3");
      } else {
        rect(429, 20, 14, 14, "#f3eac8");
      }
      return;
    }
    const seasonGround = ["#73945d", "#7e9a55", "#b28653", "#d4d8d4"][season % 4];
    const seasonAccent = [colors.plant, "#89ae55", "#c87854", "#8799a7"][season % 4];
    const sky = night ? "#41516c" : evening ? "#e8a47d" : colors.sky;
    rect(0, 0, 480, 200, sky);
    rect(0, 70, 480, 48, season === 3 ? "#b7c5c4" : "#a7c9a0");
    rect(0, 102, 480, 29, season === 3 ? "#9eaeac" : "#83ad78");
    // Layered hills and a winding lane give the village depth at every scale.
    rect(0, 96, 126, 12, season === 3 ? "#c4d0ca" : "#789b74");
    rect(0, 90, 50, 8, season === 3 ? "#c4d0ca" : "#789b74");
    rect(337, 86, 143, 19, season === 3 ? "#bdc9c1" : "#779675");
    rect(389, 78, 91, 10, season === 3 ? "#bdc9c1" : "#779675");
    if (night) {
      rect(404, 19, 16, 16, "#f6e8bd");
      rect(409, 16, 16, 16, sky);
    } else {
      rect(399, 18, 23, 23, "#ffe5a3");
      rect(393, 25, 5, 10, "#ffe5a3");
      rect(423, 25, 5, 10, "#ffe5a3");
      rect(54, 31, 35, 5, "#e4eee0");
      rect(61, 26, 22, 6, "#e4eee0");
      rect(82, 31, 9, 4, "#e4eee0");
      rect(278, 48, 42, 4, "#e4eee0");
      rect(286, 43, 24, 6, "#e4eee0");
      rect(310, 47, 12, 4, "#e4eee0");
    }
    // Distant cottages.
    rect(45, 79, 43, 29, "#e6c99a");
    rect(39, 74, 55, 7, "#945f55");
    rect(52, 88, 10, 12, "#668891");
    rect(72, 89, 9, 19, "#875e48");
    rect(286, 80, 49, 29, "#e8d2a8");
    rect(278, 75, 64, 7, "#8c5d53");
    rect(294, 89, 12, 10, "#759392");
    // Main cottage: layered roof, timber edge, windows and welcoming porch.
    rect(137, 62, 175, 69, "#e7d0a4");
    rect(126, 59, 195, 13, "#754c4e");
    rect(139, 49, 171, 13, "#a85f57");
    rect(157, 42, 136, 9, "#754c4e");
    rect(160, 38, 6, 16, "#4c5056");
    rect(166, 34, 13, 6, "#d5b99a");
    rect(136, 69, 177, 5, "#553f49");
    for (let x = 136; x < 312; x += 15) {
      rect(x, 51, 2, 15, x % 2 ? "#b76d5d" : "#8f534f");
      rect(x + 4, 63, 8, 3, "#c77a65");
    }
    rect(139, 74, 4, 53, "#b88d68");
    rect(305, 74, 4, 53, "#b88d68");
    rect(149, 82, 39, 32, "#476c70");
    rect(153, 86, 31, 24, night ? "#efc77c" : "#a9d2cb");
    rect(168, 86, 3, 24, "#526c67");
    rect(153, 97, 31, 3, "#526c67");
    rect(151, 84, 35, 3, "#e8dfbd");
    rect(267, 82, 32, 32, "#476c70");
    rect(271, 86, 24, 24, night ? "#efc77c" : "#a9d2cb");
    rect(282, 86, 3, 24, "#526c67");
    rect(271, 97, 24, 3, "#526c67");
    rect(269, 84, 28, 3, "#e8dfbd");
    rect(214, 89, 30, 42, "#805447");
    rect(219, 94, 20, 37, "#ba8460");
    rect(232, 109, 3, 3, "#f4dfaa");
    rect(130, 127, 190, 8, "#b78765");
    rect(146, 135, 9, 14, "#805d50");
    rect(294, 135, 9, 14, "#805d50");
    // Garden rows, fence, stepping stones and a little shop sign.
    rect(0, 143, 480, 57, seasonGround);
    rect(0, 143, 480, 5, season === 3 ? "#aebbbb" : "#8eae69");
    for (let x = 4; x < 475; x += 27) {
      const tuft = (x * 7 + seed) % 9;
      rect(x, 151 + tuft, 2, 4, seasonAccent);
      rect(x + 6, 158 + (tuft % 5), 2, 3, "#b5c477");
    }
    rect(0, 143, 480, 5, "#ad936a");
    rect(0, 168, 480, 32, "#c6a679");
    for (let x = 0; x < 480; x += 34) {
      rect(x, 165, 3, 19, "#eee0ba");
      rect(x + 7, 179, 17, 3, "#eee0ba");
    }
    rect(345, 120, 7, 28, "#805943");
    rect(324, 119, 48, 18, "#c26f55");
    rect(331, 123, 34, 3, "#f5d893");
    rect(17, 137, 4, 16, "#775343");
    rect(20, 132, 34, 4, "#775343");
    rect(52, 132, 4, 16, "#775343");
    rect(70, 139, 4, 15, "#79563f");
    rect(65, 127, 15, 14, seasonAccent);
    rect(58, 133, 29, 9, seasonAccent);
    for (const x of [103, 118, 392, 410, 428]) {
      rect(x + 8, 119, 6, 28, "#76513e");
      rect(x + 2, 107, 19, 16, seasonAccent);
      rect(x + 5, 100, 16, 13, seasonAccent);
      rect(x + 9, 94, 10, 12, seasonAccent);
      rect(x + 5, 108, 5, 4, season === 2 ? "#d5bd72" : "#9abd79");
      rect(x + 14, 101, 4, 4, season === 2 ? "#e29a72" : "#a9c97f");
      if (season === 3) rect(x - 2, 105, 26, 4, "#d8e4e3");
    }
    for (let x = 18; x < 110; x += 22) {
      rect(x, 155, 15, 6, "#755b4b");
      rect(x + 4, 151, 7, 5, seasonAccent);
    }
  }

  function drawWindow(location, hour, colors, seed, season, urban) {
    rect(21, 20, 258, 130, "#24324a");
    rect(27, 26, 246, 118, "#dec7a4");
    context.save();
    context.beginPath();
    context.rect(33, 32, 234, 106);
    context.clip();
    if (urban) drawSkyline(location, hour, colors, seed);
    else drawCozyVillage(location, hour, colors, seed, season, urban);
    context.restore();
    rect(145, 26, 7, 118, "#5b5260");
    rect(28, 83, 244, 7, "#5b5260");
    rect(18, 145, 266, 8, "#efe0b9");
    rect(24, 153, 254, 4, "#aa876f");
  }

  function drawIndoorBackground(kind, location, hour, colors, seed, season, urban, job = "") {
    if (kind === "study") {
      // A complete Thai classroom: green board, wall fan, desk rows and a small view outside.
      rect(0, 0, 480, 200, "#d9d7c6");
      rect(0, 0, 480, 17, "#f1e7d0");
      rect(0, 142, 480, 58, "#98725a");
      rect(0, 146, 480, 4, "#c5a37d");
      rect(21, 27, 87, 81, "#354359");
      rect(27, 33, 75, 69, "#93c4cf");
      context.save();
      context.beginPath();
      context.rect(29, 35, 71, 65);
      context.clip();
      drawThaiLocation(location, hour, colors, seed, season, urban);
      context.restore();
      rect(119, 26, 295, 86, "#5d594e");
      rect(125, 32, 283, 74, "#2e5148");
      rect(146, 51, 88, 4, "#e3dbb4");
      rect(146, 65, 116, 3, "#c7d0a8");
      rect(146, 78, 68, 3, "#e3dbb4");
      rect(287, 48, 91, 3, "#c7d0a8");
      rect(287, 63, 72, 3, "#e3dbb4");
      rect(26, 118, 80, 22, "#815a42");
      rect(34, 111, 64, 8, "#d0ac70");
      rect(42, 123, 11, 12, "#76949a");
      rect(60, 121, 12, 14, "#d59a72");
      rect(82, 120, 9, 15, "#e1cd91");
      rect(425, 29, 29, 29, "#a7a696");
      rect(431, 35, 17, 17, "#73868b");
      rect(437, 17, 5, 12, "#747d7c");
      rect(421, 57, 38, 4, "#8c8979");
      rect(0, 169, 480, 4, "#714f43");
      rect(17, 176, 98, 5, "#b28a63");
      rect(335, 176, 123, 5, "#b28a63");
      return;
    }

    if (kind === "work") {
      const medical = /แพทย์|พยาบาล|สุขภาพ|หมอ/.test(job);
      const farm = /เกษตร|สวน|ฟาร์ม/.test(job);
      const handsOn = /ช่าง|ก่อสร้าง|ครัว|อาหาร|ฝึก/.test(job);
      const service = /บริการ|ร้าน|ขาย|โรงแรม|พนักงาน/.test(job);
      if (farm) {
        drawThaiLocation(location, hour, colors, seed, season, false);
        rect(0, 134, 480, 66, "#78984c");
        for (let x = 0; x < 480; x += 31) {
          rect(x, 143, 2, 45, "#c9ce76");
          rect(x + 13, 151, 2, 38, "#d3ce7b");
        }
        rect(30, 56, 103, 69, "#a8754e");
        rect(20, 49, 123, 11, "#754c46");
        rect(40, 65, 79, 8, "#c28d59");
        rect(48, 79, 11, 45, "#694b3c");
        rect(104, 79, 11, 45, "#694b3c");
        rect(365, 116, 68, 25, "#9b6b4a");
        rect(371, 109, 55, 9, "#d5ae71");
        for (let x = 377; x < 423; x += 14) rect(x, 119, 5, 18, "#d9b375");
        return;
      }

      const wall = medical ? "#d7e5dc" : handsOn ? "#d4c5a9" : service ? "#d8cba9" : "#c7d6d2";
      rect(0, 0, 480, 200, wall);
      rect(0, 0, 480, 16, medical ? "#edf2e6" : "#e7ddc6");
      rect(0, 144, 480, 56, medical ? "#7d9c8e" : handsOn ? "#765c4b" : service ? "#956c4f" : "#75665c");
      if (medical) {
        rect(26, 29, 127, 77, "#becfc7");
        rect(32, 35, 115, 65, "#edf3e7");
        rect(82, 54, 19, 7, "#c16d75");
        rect(88, 48, 7, 19, "#c16d75");
        rect(192, 77, 196, 51, "#cbd7cf");
        rect(203, 69, 164, 18, "#f0eee2");
        rect(211, 86, 9, 41, "#819d91");
        rect(351, 86, 9, 41, "#819d91");
        rect(39, 120, 94, 10, "#8e6b51");
        rect(47, 130, 9, 19, "#68594b");
        rect(115, 130, 9, 19, "#68594b");
        rect(414, 45, 30, 76, "#95b0a4");
        rect(420, 52, 18, 21, "#f0f0df");
      } else if (handsOn) {
        rect(26, 26, 172, 92, "#796953");
        rect(33, 33, 158, 78, "#ad976d");
        rect(50, 48, 116, 7, "#4a5151");
        for (let x = 59; x < 171; x += 28) {
          rect(x, 57, 9, 39, x % 2 ? "#d29b5e" : "#89958d");
          rect(x + 3, 66, 3, 19, "#554f48");
        }
        rect(280, 75, 153, 54, "#8b6547");
        rect(270, 68, 174, 10, "#c59866");
        rect(290, 129, 11, 25, "#594d44");
        rect(416, 129, 11, 25, "#594d44");
        rect(315, 50, 74, 16, "#ba7957");
        rect(324, 53, 57, 4, "#e4c28c");
      } else if (service) {
        rect(28, 27, 142, 91, "#846349");
        rect(35, 34, 128, 77, "#e6d6b4");
        for (let y = 47; y < 100; y += 24) {
          rect(41, y, 116, 4, "#a37a56");
          rect(51, y - 12, 14, 12, "#c78267");
          rect(76, y - 15, 19, 15, "#7e9f88");
          rect(107, y - 13, 17, 13, "#d0ad6c");
          rect(134, y - 14, 14, 14, "#8098a4");
        }
        rect(214, 91, 225, 48, "#9b6c50");
        rect(204, 82, 245, 12, "#dab77d");
        rect(230, 105, 30, 22, "#d5aa69");
        rect(270, 103, 45, 24, "#76988c");
        rect(332, 104, 38, 23, "#c57c62");
      } else {
        rect(22, 25, 436, 98, "#aab9b5");
        rect(29, 32, 422, 84, "#d8e1d6");
        rect(42, 45, 65, 57, "#6e8fa3");
        rect(48, 51, 53, 45, hour > 19 ? "#374761" : "#9cc4c5");
        rect(125, 45, 44, 58, "#c2b38d");
        rect(187, 45, 44, 58, "#c2b38d");
        rect(249, 45, 44, 58, "#c2b38d");
        rect(311, 45, 44, 58, "#c2b38d");
        rect(373, 45, 44, 58, "#c2b38d");
        for (let x = 133; x < 415; x += 62) {
          rect(x, 53, 28, 4, "#edf0e1");
          rect(x, 65, 20, 4, "#edf0e1");
          rect(x, 78, 32, 4, "#edf0e1");
        }
        rect(37, 127, 406, 12, "#685a50");
        rect(51, 138, 12, 20, "#4d4d51");
        rect(417, 138, 12, 20, "#4d4d51");
      }
      rect(0, 158, 480, 4, "#d4b27c");
      return;
    }

    rect(0, 0, 480, 200, "#e6d7bf");
    rect(0, 0, 480, 12, "#e4e8de");
    rect(0, 145, 480, 55, "#8c7768");
    drawWindow(location, hour, colors, seed, season, urban);
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

  function drawOutside(kind, location, hour, colors, seed, season, urban) {
    drawCozyVillage(location, hour, colors, seed, season, urban);
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

  function drawKitchenScene(location, hour, colors, seed, season, urban) {
    drawIndoorBackground("home", location, hour, colors, seed, season, urban);
    rect(0, 0, 480, 145, "#e8dcc5");
    // Kitchen window, hanging pans, tiled backsplash, and a stove.
    drawWindow(location, hour, colors, seed, season, urban);
    rect(294, 25, 166, 80, "#e8dfcd");
    for (let y = 31; y < 103; y += 18)
      for (let x = 301 + (y % 2) * 8; x < 457; x += 24)
        rect(x, y, 1, 1, "#a9aa99");
    rect(300, 106, 169, 12, "#9a7055");
    rect(312, 118, 11, 36, "#725849");
    rect(445, 118, 11, 36, "#725849");
    rect(344, 122, 43, 22, "#4b5257");
    rect(349, 117, 33, 7, "#b7c3b4");
    rect(352, 128, 9, 5, "#d39b69");
    rect(371, 128, 9, 5, "#d39b69");
    rect(400, 91, 41, 15, "#d09a67");
    rect(410, 84, 20, 7, "#91a56b");
    // Rice cooker, jars and hanging utensils make this a lived-in Thai kitchen.
    rect(34, 28, 116, 72, "#927353");
    rect(40, 34, 104, 60, "#c9a675");
    for (let y = 43; y < 87; y += 21) {
      rect(44, y, 96, 3, "#795b48");
      rect(53, y - 11, 15, 10, "#c77c5f");
      rect(78, y - 14, 20, 13, "#e4d2a5");
      rect(108, y - 12, 17, 11, "#779682");
    }
    rect(383, 116, 44, 28, "#e4e4d8");
    rect(389, 111, 32, 7, "#faf2dc");
    rect(396, 120, 17, 3, "#8c9b94");
    rect(396, 132, 18, 3, "#bd7466");
    rect(300, 52, 4, 38, "#70594a");
    rect(293, 83, 18, 6, "#b2a080");
    rect(326, 54, 4, 35, "#70594a");
    rect(319, 82, 18, 6, "#b2a080");
    rect(348, 49, 6, 16, "#806c56");
    rect(341, 64, 20, 5, "#c0a77a");
    for (let x = 12; x < 480; x += 42) rect(x, 161, 2, 33, "#9c7960");
  }

  function drawLivingRoomScene(location, hour, colors, seed, season, urban) {
    drawIndoorBackground("home", location, hour, colors, seed, season, urban);
    rect(0, 0, 480, 145, "#e8dcc5");
    drawWindow(location, hour, colors, seed, season, urban);
    rect(0, 145, 480, 55, "#876b5c");
    rect(284, 119, 138, 28, "#668078");
    rect(276, 111, 151, 16, "#8caa99");
    rect(287, 145, 10, 14, "#594e4d");
    rect(409, 145, 10, 14, "#594e4d");
    rect(151, 148, 158, 8, "#9a7557");
    rect(163, 156, 8, 20, "#665448");
    rect(291, 156, 8, 20, "#665448");
    rect(181, 138, 29, 10, "#d9bd8b");
    rect(225, 140, 34, 8, "#8da296");
    rect(40, 114, 9, 31, "#795a45");
    rect(28, 104, 32, 12, "#8cad77");
    rect(31, 94, 25, 10, "#7b9b68");
    // Family photo, curtains, cushions and a tea tray make this Thai home feel lived in.
    rect(350, 30, 53, 44, "#8a674e");
    rect(355, 35, 43, 34, "#e1c999");
    rect(359, 39, 35, 26, "#91b7b7");
    rect(360, 53, 33, 12, "#72875f");
    rect(369, 46, 7, 8, "#bd806b");
    rect(380, 43, 7, 10, "#58617b");
    rect(24, 37, 14, 59, "#bc8065");
    rect(64, 37, 14, 59, "#bc8065");
    rect(31, 39, 40, 8, "#d9b17a");
    rect(298, 122, 29, 12, "#d5a274");
    rect(385, 122, 27, 12, "#d5a274");
    rect(178, 136, 36, 6, "#845a43");
    rect(184, 132, 9, 5, "#e2d2b2");
    rect(198, 132, 9, 5, "#d99070");
    for (let x = 12; x < 480; x += 48) rect(x, 181, 2, 19, "#9a7966");
  }

  function drawBedroomScene(location, hour, colors, seed, season, urban) {
    drawIndoorBackground("home", location, hour, colors, seed, season, urban);
    rect(0, 0, 480, 145, "#d9d2c6");
    drawWindow(location, hour, colors, seed, season, urban);
    rect(0, 145, 480, 55, "#79665c");
    rect(271, 117, 167, 37, "#574f5a");
    rect(280, 108, 151, 36, "#d8d8ca");
    rect(286, 112, 59, 17, "#91aeb1");
    rect(345, 129, 91, 15, hour < 6 || hour >= 20 ? "#536b7d" : "#b89d7b");
    rect(266, 146, 177, 9, "#8c6d56");
    rect(281, 155, 9, 18, "#665248");
    rect(420, 155, 9, 18, "#665248");
    rect(218, 128, 42, 18, "#a9835f");
    rect(223, 134, 31, 10, "#d8b984");
    rect(228, 129, 23, 5, "#e9dfc4");
    rect(43, 115, 8, 30, "#745b48");
    rect(31, 106, 32, 11, "#90aa78");
    // Patchwork quilt, bedside lamp, books and slippers make this room read as a bedroom.
    rect(295, 113, 132, 8, "#81989c");
    for (let x = 298; x < 420; x += 18) {
      rect(x, 121, 12, 7, x % 2 ? "#d5bd87" : "#a9b5a0");
      rect(x + 5, 130, 10, 7, x % 3 ? "#b88070" : "#81989c");
    }
    rect(226, 107, 24, 20, "#7e5e47");
    rect(231, 99, 14, 9, "#e6cc84");
    rect(235, 104, 6, 5, "#fff0bc");
    rect(294, 157, 19, 5, "#b98968");
    rect(319, 157, 19, 5, "#b98968");
    rect(360, 83, 56, 15, "#a98c70");
    rect(366, 86, 44, 8, "#e4dac3");
    for (let x = 15; x < 480; x += 48) rect(x, 183, 2, 17, "#938071");
  }

  function drawTravelScene(location, hour, colors, seed, urban) {
    drawSkyline(location, hour, colors, seed);
    rect(0, 126, 480, 74, "#5b6265");
    rect(0, 128, 480, 6, "#d4bd8a");
    rect(0, 154, 480, 5, "#d9d6c6");
    rect(0, 180, 480, 4, "#d9d6c6");
    rect(30, 48, 167, 59, "#37424c");
    rect(36, 54, 155, 47, "#263e4b");
    rect(48, 66, 10, 28, "#e2d7b5");
    rect(61, 66, 99, 4, "#c9d5cb");
    rect(61, 78, 78, 3, "#a9b9b0");
    rect(61, 90, 112, 3, "#a9b9b0");
    // A train carriage or airport shuttle makes a move/trip read immediately.
    rect(260, 111, 168, 45, urban ? "#d9ddd1" : "#d6c8aa");
    rect(270, 119, 36, 21, "#567889");
    rect(312, 119, 36, 21, "#567889");
    rect(354, 119, 36, 21, "#567889");
    rect(397, 118, 18, 38, "#bb815f");
    rect(279, 156, 23, 8, "#343a42");
    rect(380, 156, 23, 8, "#343a42");
    rect(188, 144, 26, 28, "#78624f");
    rect(192, 149, 18, 12, "#c28c60");
    rect(74, 31, 108, 20, "#e4d7b7");
    rect(80, 35, 96, 3, "#6d8390");
    rect(80, 42, 73, 3, "#9a8e78");
    rect(78, 58, 74, 34, "#897357");
    rect(82, 62, 66, 26, "#b89b70");
    rect(92, 67, 9, 13, "#d7b66e");
    rect(109, 64, 11, 16, "#78928a");
    rect(127, 68, 13, 12, "#c98567");
    for (let x = 10; x < 480; x += 42) rect(x, 183, 20, 3, "#e1c78d");
    rect(40, 104, 6, 3, "#e4c978");
    rect(178, 104, 6, 3, "#e4c978");
  }

  function drawCareScene(location, hour, colors, seed, season, urban) {
    drawIndoorBackground("work", location, hour, colors, seed, season, urban, "สุขภาพ");
    rect(0, 0, 480, 145, "#e1ece5");
    drawWindow(location, hour, colors, seed, season, urban);
    rect(296, 25, 165, 82, "#c8d8d0");
    rect(302, 31, 153, 70, "#edf3e9");
    rect(373, 43, 15, 6, "#c56e77");
    rect(377, 38, 6, 16, "#c56e77");
    rect(319, 61, 114, 3, "#b5c5bc");
    rect(319, 73, 90, 3, "#b5c5bc");
    rect(288, 126, 157, 16, "#d8d4c8");
    rect(301, 108, 117, 19, "#f0eee3");
    rect(300, 108, 119, 5, "#8da8a2");
    rect(312, 142, 9, 14, "#758b83");
    rect(411, 142, 9, 14, "#758b83");
  }

  function sceneForEvent(event) {
    if (typeof event === "object" && event?.scene) return event.scene;
    const age = typeof event === "number" ? event : event?.age || 0;
    if (age <= 5) return "childhood";
    if (age <= 16) return age === 8 ? "school" : "learning";
    if (age <= 24) return "new-start";
    if (age <= 29) return age === 29 ? "travel" : "work";
    if (age <= 40) return "family";
    if (age <= 56) return age >= 45 ? "care" : "home";
    return "retirement";
  }

  function drawEventScene(scene, state, hour, colors, seed, season) {
    const { location, urban } = state;
    if (scene === "songkran") {
      drawThaiLocation(location, hour, colors, seed, season, urban);
      // A neighborhood Songkran: shade cloth, water bowls and a shared street table.
      rect(0, 120, 480, 80, "#bc9a70");
      rect(18, 50, 176, 8, "#8b594c");
      rect(23, 58, 164, 30, "#e5c17b");
      rect(43, 88, 7, 32, "#785842");
      rect(165, 88, 7, 32, "#785842");
      rect(58, 76, 20, 19, "#d0a46d");
      rect(62, 70, 12, 7, "#f0ead1");
      rect(94, 75, 23, 20, "#7897a3");
      rect(99, 69, 13, 7, "#e3d9c3");
      rect(286, 130, 45, 31, "#6c99a4");
      rect(291, 124, 35, 9, "#d6e6db");
      rect(348, 125, 45, 36, "#7099a2");
      rect(354, 119, 33, 9, "#d6e6db");
      for (let i = 0; i < 6; i++) {
        rect(202 + i * 12, 32 + (i % 2) * 8, 5, 7, i % 2 ? "#e4a878" : "#e8d18d");
      }
      rect(336, 151, 9, 4, "#c8e8ef");
      rect(321, 143, 7, 4, "#c8e8ef");
      rect(400, 162, 9, 4, "#c8e8ef");
    } else if (scene === "wai-khru") {
      drawIndoorBackground("study", location, hour, colors, seed, season, urban);
      rect(286, 27, 161, 58, "#38594d");
      rect(294, 34, 145, 45, "#29473e");
      rect(309, 48, 79, 3, "#eadfb8");
      rect(309, 59, 111, 3, "#d4dbbe");
      rect(42, 134, 395, 14, "#9b7253");
      rect(58, 148, 12, 34, "#65544a");
      rect(408, 148, 12, 34, "#65544a");
      rect(93, 125, 43, 9, "#e7dcc5");
      rect(153, 119, 15, 15, "#a85e59");
      rect(157, 112, 7, 8, "#e9cf88");
      rect(174, 115, 7, 19, "#648d68");
      rect(169, 118, 17, 5, "#d9bd78");
      rect(269, 125, 43, 9, "#e7dcc5");
      rect(320, 119, 15, 15, "#a85e59");
      rect(324, 112, 7, 8, "#e9cf88");
      rect(341, 115, 7, 19, "#648d68");
      rect(336, 118, 17, 5, "#d9bd78");
      state.seated = false;
    } else if (scene === "loy-krathong") {
      rect(0, 0, 480, 200, "#26334d");
      rect(0, 0, 480, 63, "#202b43");
      rect(45, 24, 19, 19, "#f4e8be");
      rect(67, 30, 8, 8, "#f4e8be");
      rect(0, 94, 480, 24, "#4d5c70");
      for (let x = 0; x < 480; x += 49) {
        rect(x + 6, 70 + (x % 3) * 4, 25, 28, x % 2 ? "#596675" : "#66737b");
        rect(x + 12, 77 + (x % 2) * 5, 4, 5, "#edc778");
      }
      rect(0, 119, 480, 81, "#315d6b");
      for (let x = 8; x < 480; x += 32) {
        rect(x, 126 + (x % 3) * 5, 13, 2, "#63949a");
      }
      // Banana-leaf krathongs and small candle reflections float on the water.
      for (const x of [78, 182, 298, 405]) {
        rect(x, 129 + (x % 2) * 6, 26, 5, "#d4a663");
        rect(x + 3, 125 + (x % 2) * 6, 19, 5, "#6d9a63");
        rect(x + 12, 120 + (x % 2) * 6, 3, 5, "#f5d78e");
        rect(x + 13, 117 + (x % 2) * 6, 2, 3, "#f0ae70");
        rect(x + 11, 140 + (x % 2) * 6, 4, 16, "#e2bf72");
      }
      if (location?.city === "เชียงใหม่") {
        for (const x of [109, 233, 359]) {
          rect(x, 41, 5, 12, "#d2a86c");
          rect(x + 2, 36, 3, 5, "#f0d18b");
        }
      }
    } else if (scene === "childhood" || scene === "retirement") {
      if (urban) drawSkyline(location, hour, colors, seed);
      else drawCozyVillage(location, hour, colors, seed, season);
      rect(28, 141, 88, 8, "#8a674d");
      rect(38, 149, 7, 26, "#68564b");
      rect(98, 149, 7, 26, "#68564b");
      rect(52, 128, 39, 13, "#d5aa68");
      rect(57, 116, 29, 12, "#81a96e");
    } else if (scene === "school" || scene === "learning") {
      drawIndoorBackground("study", location, hour, colors, seed, season, urban);
      rect(307, 28, 147, 68, "#34574c");
      rect(315, 36, 131, 52, "#29473e");
      rect(327, 47, 91, 3, "#e9e1bc");
      rect(327, 60, 105, 3, "#c9d5b6");
      rect(327, 73, 68, 3, "#e9e1bc");
      rect(66, 153, 348, 10, "#997054");
      rect(78, 163, 8, 33, "#69574c");
      rect(394, 163, 8, 33, "#69574c");
      rect(105, 142, 47, 10, "#eee1bd");
      rect(293, 142, 45, 10, "#eee1bd");
      state.seated = true;
    } else if (scene === "work" || scene === "new-start") {
      const studying = /นักเรียน|นักศึกษา/.test(state.job || "");
      if (scene === "new-start" && studying) {
        drawIndoorBackground("study", location, hour, colors, seed, season, urban);
        rect(58, 149, 364, 11, "#997054");
        rect(72, 160, 9, 34, "#69574c");
        rect(398, 160, 9, 34, "#69574c");
        rect(114, 138, 53, 10, "#eee1bd");
        rect(302, 138, 51, 10, "#eee1bd");
        state.seated = true;
      } else {
        drawIndoorBackground("work", location, hour, colors, seed, season, urban, state.job);
        rect(73, 150, 338, 12, "#795e50");
        rect(85, 162, 10, 34, "#514b48");
        rect(390, 162, 10, 34, "#514b48");
        rect(126, 130, 70, 19, "#e2d6ba");
        rect(135, 123, 49, 7, "#869d9d");
        rect(306, 136, 56, 13, "#ba8c65");
        state.seated = /พนักงาน|นักบัญชี|เจ้าหน้าที่|ประสานงาน/.test(state.job || "");
      }
    } else if (scene === "travel") {
      drawTravelScene(location, hour, colors, seed, urban);
    } else if (scene === "care") {
      drawCareScene(location, hour, colors, seed, season, urban);
    } else {
      drawLivingRoomScene(location, hour, colors, seed, season, urban);
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

  function drawCharacterBody(x, floor, state, frame) {
    const { kind } = state.activity;
    const look = state.character || {};
    const step = kind === "commute" || kind === "travel" ? (frame ? 3 : -2) : 0;
    const studentUniform = kind === "study" && state.age >= 6 && state.age < 18;
    const medicalUniform = kind === "work" && /แพทย์|พยาบาล|สุขภาพ|หมอ/.test(state.job || "");
    const body = studentUniform
      ? "#e7e4d8"
      : medicalUniform
        ? "#78a69c"
        : look.shirt || (kind === "work" ? "#60798e" : "#7b9ad0");
    const hair =
      look.hair ||
      (state.age < 24 ? "#334263" : state.age < 50 ? "#443852" : "#77705d");
    const skin = look.skin || palette.skin;
    const jacket = kind === "commute" ? "#c17b67" : body;
    const seated = state.seated;
    rect(x - 21, floor + 1, 44, 4, "#403f4b");

    // Shoes, legs, and jacket use one-pixel outlines to read like a small game sprite.
    if (seated) {
      rect(x - 12, floor - 24, 11, 11, "#34415b");
      rect(x + 2, floor - 24, 11, 11, "#34415b");
      rect(x - 15, floor - 15, 18, 5, "#242c42");
      rect(x + 1, floor - 15, 18, 5, "#242c42");
    } else {
      rect(x - 12, floor - 18 + step, 10, 18, "#34415b");
      rect(x + 2, floor - 18 - step, 10, 18, "#34415b");
      rect(x - 15, floor - 3 + step, 15, 5, "#242c42");
      rect(x + 1, floor - 3 - step, 16, 5, "#242c42");
    }
    rect(x - 15, floor - 44, 31, 28, palette.outline);
    rect(x - 12, floor - 42, 25, 24, jacket);
    rect(x - 12, floor - 22, 25, 3, "#536780");
    rect(x - 2, floor - 41, 3, 21, kind === "study" ? "#d6e2d0" : "#efd09a");
    rect(x - 5, floor - 44, 11, 4, studentUniform ? "#d2d0c7" : "#e6d7bd");
    rect(x - 1, floor - 38, 2, 2, "#f3d38f");
    rect(x - 1, floor - 32, 2, 2, "#f3d38f");
    rect(x - 17, floor - 42, 7, 20, palette.outline);
    rect(x - 15, floor - 40, 5, 16, jacket);
    rect(x - 19, floor - 38 + (frame ? 1 : 0), 6, 17, skin);
    rect(x + 11, floor - 40 + (frame ? -1 : 1), 7, 17, skin);
    rect(x - 19, floor - 24, 6, 3, skin);
    rect(x + 12, floor - 24, 6, 3, skin);
    if (seated) {
      rect(x - 20, floor - 35, 7, 13, skin);
      rect(x + 13, floor - 35, 7, 13, skin);
      rect(x - 15, floor - 24, 8, 4, skin);
      rect(x + 8, floor - 24, 8, 4, skin);
    } else if (kind === "cook") {
      rect(x + 13, floor - 40, 12, 7, skin);
      rect(x + 22, floor - 34, 8, 4, skin);
      rect(x - 10, floor - 40, 20, 4, "#f0e9d8");
      rect(x - 4, floor - 38, 9, 17, "#e9e2d0");
    } else if (kind === "exercise") {
      rect(x - 23 + (frame ? 3 : 0), floor - 37, 9, 8, skin);
      rect(x + 13 - (frame ? 3 : 0), floor - 35, 10, 8, skin);
    }
    rect(x - 14, floor - 69, 28, 27, palette.outline);
    rect(x - 12, floor - 67, 24, 23, skin);
    rect(x - 15, floor - 61, 4, 7, skin);
    rect(x + 12, floor - 61, 4, 7, skin);

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
    rect(x - 1, floor - 56, 2, 3, "#d9957e");
    rect(x - 1, floor - 50, 3, 2, "#a65f63");
    rect(x - 11, floor - 72, 5, 3, "#7285a7");
    rect(x + 6, floor - 72, 6, 3, "#7285a7");
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

  function drawBabySprite(x, floor, state) {
    const look = state.character || {};
    const blanket = look.shirt || "#8fae91";
    const skin = look.skin || palette.skin;
    rect(x - 28, floor + 1, 54, 4, "#4d5946");
    rect(x - 21, floor - 14, 5, 8, "#43505a");
    rect(x + 12, floor - 14, 5, 8, "#43505a");
    rect(x - 27, floor - 21, 53, 10, "#644f47");
    rect(x - 24, floor - 26, 45, 12, "#d7bd8e");
    rect(x - 21, floor - 24, 39, 7, blanket);
    rect(x - 9, floor - 34, 20, 15, "#374255");
    rect(x - 7, floor - 32, 16, 12, skin);
    rect(x - 9, floor - 35, 21, 6, look.hair || "#3d3543");
    rect(x - 5, floor - 27, 2, 2, "#3b4655");
    rect(x + 3, floor - 27, 2, 2, "#3b4655");
    rect(x - 25, floor - 19, 3, 7, "#e6d3ac");
    rect(x + 18, floor - 19, 3, 7, "#e6d3ac");
  }

  function drawRestingSprite(x, floor, state, frame) {
    const look = state.character || {};
    const skin = look.skin || palette.skin;
    rect(x - 37, floor - 29, 66, 13, "#343d53");
    rect(x - 34, floor - 27, 59, 9, look.shirt || "#7899d5");
    rect(x + 17, floor - 43, 20, 20, "#343d53");
    rect(x + 19, floor - 41, 16, 16, skin);
    rect(x + 16, floor - 45, 21, 7, look.hair || "#26324b");
    rect(x + 12, floor - 38, 8, 15, look.hair || "#26324b");
    rect(x + 24, floor - 35, 2, 2, "#263d62");
    rect(x + 30, floor - 35, 2, 2, "#263d62");
    rect(x - 2, floor - 25 + (frame ? 1 : 0), 18, 4, skin);
    rect(x - 23, floor - 31, 25, 8, "#d7bd8e");
  }

  function drawAnimeCharacter(x, floor, state, frame) {
    const age = Number(state.age || 0);
    if (age < 1.5) {
      context.save();
      context.translate(x * -0.12, floor * -0.12);
      context.scale(1.12, 1.12);
      drawBabySprite(x, floor, state);
      context.restore();
      return;
    }
    if (state.activity.kind === "rest") {
      context.save();
      context.translate(x * -0.14, floor * -0.14);
      context.scale(1.14, 1.14);
      drawRestingSprite(x, floor, state, frame);
      context.restore();
      return;
    }
    const scale = age < 6 ? 0.68 : age < 13 ? 0.82 : age < 17 ? 0.96 : age >= 70 ? 1.02 : 1.08;
    context.save();
    context.translate(x * (1 - scale), floor * (1 - scale));
    context.scale(scale, scale);
    drawCharacterBody(x, floor, state, frame);
    context.restore();
  }

  function draw(timestamp, state) {
    const location = state.location;
    const activity = state.activity;
    const colors = colorsFor(location);
    const seed = (location?.iso || "world")
      .split("")
      .reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
    const hour = Math.floor((state.clockMinutes || 0) / 60);
    const season = Math.floor(((state.age || 0) % 1) * 4);
    const kind = activity.kind;
    const urban = state.urban === true;
    const eventScene = state.event ? sceneForEvent(state.event) : null;
    if (eventScene) {
      drawEventScene(eventScene, state, hour, colors, seed, season);
    } else if (kind === "study") {
      drawIndoorBackground("study", location, hour, colors, seed, season, urban);
      const desk = drawDesk("study", colors, hour);
      state.seated = desk.seated;
    } else if (kind === "work") {
      drawIndoorBackground("work", location, hour, colors, seed, season, urban, state.job);
      const desk = drawDesk("work", colors, hour);
      state.seated = desk.seated;
    } else if (kind === "cook") {
      drawKitchenScene(location, hour, colors, seed, season, urban);
    } else if (kind === "rest") {
      drawBedroomScene(location, hour, colors, seed, season, urban);
    } else if (kind === "travel") {
      drawTravelScene(location, hour, colors, seed, urban);
    } else if (kind === "commute") {
      drawOutside(kind, location, hour, colors, seed, season, urban);
      if (urban) drawSkyline(location, hour, colors, seed);
      rect(0, 153, 480, 47, "#565d60");
      rect(0, 153, 480, 5, "#e1d4b4");
    } else if (kind === "exercise" || kind === "lunch") {
      if (urban) drawSkyline(location, hour, colors, seed);
      else drawCozyVillage(location, hour, colors, seed, season, urban);
      if (kind === "exercise") {
        rect(35, 129, 7, 34, "#795c45");
        rect(17, 120, 42, 10, "#bd805c");
        rect(15, 130, 48, 4, "#e4c28b");
        rect(368, 127, 7, 38, "#795c45");
        rect(349, 117, 44, 11, "#86a46c");
      } else {
        rect(324, 111, 129, 30, "#875a49");
        rect(317, 105, 143, 8, "#d2a46f");
        rect(332, 119, 91, 4, "#e7d4aa");
        rect(343, 128, 62, 4, "#9cae92");
      }
    } else {
      drawLivingRoomScene(location, hour, colors, seed, season, urban);
    }
    drawAnimeCharacter(
      kind === "commute" || kind === "travel" ? 222 : 245,
      169,
      state,
      Math.floor(timestamp / 240) % 2,
    );
    if (state.family?.members?.length && (state.age < 18 || ["childhood", "family", "care"].includes(eventScene))) {
      drawAnimeCharacter(312, 169, {
        ...state,
        age: 32,
        activity: { kind: "family" },
        character: { ...state.character, shirt: "#9d765d", hairstyle: 2, accessory: "none" },
      }, Math.floor(timestamp / 330) % 2);
    }
    if (state.family?.partner && (["family", "cook", "care"].includes(kind) || ["family", "care", "retirement"].includes(eventScene))) {
      drawAnimeCharacter(396, 169, {
        ...state,
        age: 30,
        activity: { kind: "family" },
        character: { ...state.character, shirt: "#b86f76", hairstyle: 3, accessory: "none" },
      }, Math.floor(timestamp / 370) % 2);
    }
    if (["work", "new-start"].includes(eventScene)) {
      drawAnimeCharacter(386, 169, {
        ...state,
        age: 34,
        activity: { kind: "work" },
        character: { ...state.character, shirt: "#6d8a82", hairstyle: 1, accessory: "none" },
      }, Math.floor(timestamp / 350) % 2);
    } else if (eventScene === "care") {
      drawAnimeCharacter(386, 169, {
        ...state,
        age: 36,
        activity: { kind: "work" },
        character: { ...state.character, shirt: "#f0ede1", hairstyle: 0, accessory: "none" },
      }, Math.floor(timestamp / 350) % 2);
    }
    // Foreground highlights make the scene feel like a framed anime game cutaway.
    rect(0, 0, 480, 3, "#202b3d");
    rect(0, 197, 480, 3, "#202b3d");
  }

  window.LifeScene = Object.freeze({ draw });
})();
