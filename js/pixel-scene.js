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
    if (!urban && villageLayers[0]?.complete && villageLayers[0].naturalWidth) {
      context.drawImage(villageLayers[0], 0, 0, 576, 150, 0, 0, 480, 125);
    }
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
      if (villageLayers[2]?.complete && villageLayers[2].naturalWidth) {
        context.drawImage(villageLayers[2], 92, 0, 162, 145, 0, 4, 162, 145);
      } else {
        rect(52, 80, 7, 64, "#76513d");
        rect(29, 78, 51, 8, "#76513d");
        rect(23, 71, 60, 8, "#4f7f54");
        rect(26, 63, 48, 9, "#5f925b");
        rect(36, 55, 37, 9, "#6a9f61");
      }
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

  function drawThaiRoomBase(location, hour, room, urban) {
    const city = location?.city || "กรุงเทพฯ";
    const north = city === "เชียงใหม่" || city === "อุดรธานี";
    const south = city === "ภูเก็ต";
    const rural = urban !== true;
    const wall = room === "bedroom" ? (north ? "#b3916f" : "#d9cdb1") : north ? "#b48f68" : south ? "#d8dfd1" : "#e5d7bb";
    const floor = rural || north ? "#806044" : south ? "#a48c72" : "#8b7567";
    rect(0, 0, 480, 200, wall);
    if (rural || north) {
      for (let y = 8; y < 146; y += 17) {
        rect(0, y, 480, 2, y % 3 ? "#c4a276" : "#98724f");
        for (let x = (y * 3) % 31; x < 480; x += 62) rect(x, y + 2, 2, 14, "#997351");
      }
    } else if (south) {
      rect(0, 12, 480, 7, "#f0ead7");
      rect(35, 28, 118, 92, "#7d8d83");
      rect(41, 34, 106, 80, "#91bac0");
      for (let x = 51; x < 141; x += 18) rect(x, 34, 3, 80, "#e6dfc9");
      rect(32, 119, 126, 6, "#805e48");
    } else {
      rect(0, 14, 480, 6, "#f2ead4");
      rect(350, 25, 87, 24, "#c6d8d1");
      rect(356, 31, 75, 12, hour < 6 || hour >= 19 ? "#52617b" : "#91b9c5");
      rect(305, 20, 42, 8, "#d3c4aa");
      rect(311, 28, 4, 18, "#786e64");
    }
    rect(0, 150, 480, 50, floor);
    rect(0, 148, 480, 5, rural ? "#c5a273" : "#d5bd91");
    for (let x = 5; x < 480; x += 54) rect(x, 177 + (x % 3), 2, 23, rural ? "#a17e59" : "#a48a71");
    if (north) {
      rect(20, 34, 37, 68, "#5d4a40");
      rect(24, 39, 29, 59, "#31485a");
      rect(32, 48, 14, 40, "#23364b");
      rect(371, 30, 73, 54, "#744e48");
      rect(377, 36, 61, 42, "#334c55");
      rect(381, 69, 53, 8, "#b27455");
      rect(387, 47, 41, 21, "#b18459");
    } else if (rural) {
      rect(396, 23, 60, 81, "#694c3a");
      rect(402, 29, 48, 69, "#91a890");
      rect(409, 36, 32, 54, "#617d69");
    } else {
      rect(20, 37, 100, 56, "#775843");
      rect(26, 43, 88, 44, "#e1c99a");
      rect(33, 49, 74, 32, south ? "#6da1a2" : "#6f93a1");
      rect(33, 70, 74, 11, "#698a68");
      rect(58, 58, 7, 12, "#bd8069");
      rect(80, 55, 8, 15, "#55536c");
    }
    if (room === "kitchen") {
      rect(0, 110, 480, 40, "#d4c5a8");
      rect(0, 108, 480, 5, "#f0e7d1");
      for (let y = 115; y < 148; y += 16)
        for (let x = 0; x < 480; x += 31) rect(x, y, 30, 1, "#b8ad98");
    }
  }

  function drawKitchenScene(location, hour, colors, seed, season, urban) {
    drawThaiRoomBase(location, hour, "kitchen", urban);
    // The kitchen is its own little stage: pantry, cooker, wok, herbs and plastic stool.
    rect(24, 28, 128, 74, "#7e5940");
    rect(31, 34, 114, 62, "#b99668");
    rect(37, 42, 103, 3, "#704f3b");
    rect(44, 47, 16, 15, "#be795b");
    rect(69, 47, 18, 15, "#e5d7b7");
    rect(100, 47, 18, 15, "#708d7b");
    rect(44, 72, 16, 16, "#ddbd7f");
    rect(69, 72, 18, 16, "#768b82");
    rect(100, 72, 18, 16, "#c17b62");
    rect(185, 28, 105, 5, "#845d43");
    rect(199, 33, 6, 23, "#594b41");
    rect(217, 34, 7, 19, "#74604d");
    rect(241, 32, 6, 25, "#9d7251");
    rect(196, 56, 13, 3, "#d1b58c");
    rect(215, 52, 18, 3, "#c3a980");
    rect(238, 57, 13, 3, "#d1b58c");
    rect(34, 111, 413, 12, "#79543c");
    rect(43, 123, 12, 27, "#5d483d");
    rect(420, 123, 12, 27, "#5d483d");
    rect(288, 96, 78, 14, "#49464b");
    rect(296, 89, 62, 8, "#c7c5b8");
    rect(301, 93, 20, 3, "#e79c58");
    rect(333, 93, 18, 3, "#e79c58");
    rect(381, 77, 49, 34, "#e0e1d4");
    rect(387, 70, 37, 9, "#f2eddb");
    rect(397, 81, 17, 4, "#749186");
    rect(400, 91, 12, 4, "#cf7760");
    rect(164, 123, 54, 28, "#6b5041");
    rect(170, 116, 42, 8, "#9c7354");
    rect(171, 127, 40, 18, "#c78e57");
    rect(175, 130, 32, 11, "#e4b86d");
    rect(180, 132, 4, 4, "#b75d4f");
    rect(190, 130, 4, 5, "#71935e");
    rect(200, 133, 5, 4, "#e0d09e");
    rect(365, 151, 45, 7, "#b27956");
    rect(369, 158, 6, 21, "#755441");
    rect(400, 158, 6, 21, "#755441");
  }

  function drawLivingRoomScene(location, hour, colors, seed, season, urban, age = 20) {
    drawThaiRoomBase(location, hour, "living", urban);
    // Family room props replace the repeated window backdrop with local furniture and keepsakes.
    rect(275, 108, 157, 35, "#65847b");
    rect(266, 101, 173, 18, "#8eaa96");
    rect(279, 140, 12, 14, "#59483d");
    rect(408, 140, 12, 14, "#59483d");
    const regionalRoom = ["เชียงใหม่", "อุดรธานี", "ภูเก็ต"].includes(location?.city);
    const photoX = regionalRoom ? 169 : 39;
    rect(photoX, 41, 88, 59, "#795943");
    rect(photoX + 6, 47, 76, 47, "#e3d2ac");
    rect(photoX + 12, 53, 64, 34, "#8ab8bb");
    rect(photoX + 13, 76, 62, 11, "#66875d");
    rect(photoX + 24, 63, 8, 13, "#bd7d66");
    rect(photoX + 40, 59, 8, 17, "#4e526a");
    rect(photoX + 57, 65, 8, 11, "#d2a26d");
    if (age < 1.5) {
      // Newborns rest in a proper cot with a light blanket and a hanging mobile.
      rect(184, 136, 120, 9, "#77543e");
      rect(190, 144, 108, 23, "#d4c09a");
      rect(197, 147, 94, 12, "#e9e1cb");
      rect(203, 140, 82, 5, "#ad8a60");
      rect(212, 127, 6, 9, "#815d43");
      rect(210, 134, 10, 3, "#d3b577");
      rect(239, 124, 6, 12, "#8d6e50");
      rect(236, 131, 12, 3, "#9a7e55");
      rect(270, 128, 6, 8, "#ba7c67");
      rect(266, 134, 13, 3, "#d5b678");
      rect(188, 165, 111, 8, "#77543e");
      rect(193, 172, 8, 7, "#604839");
      rect(286, 172, 8, 7, "#604839");
    } else {
      rect(151, 148, 159, 8, "#9a7557");
      rect(161, 156, 9, 23, "#624d40");
      rect(291, 156, 9, 23, "#624d40");
      rect(176, 139, 42, 8, "#845841");
      rect(181, 134, 10, 5, "#e2d3b4");
      rect(198, 133, 10, 6, "#ce8a68");
      rect(226, 137, 23, 8, "#879b87");
    }
    rect(38, 116, 17, 34, "#76563e");
    rect(27, 108, 39, 12, "#cc986b");
    rect(32, 99, 30, 12, "#6c9865");
    rect(39, 91, 17, 9, "#86ad70");
    // Fan and woven mat identify a lived-in Thai home; architecture shifts by region above.
    rect(442, 90, 5, 43, "#756149");
    rect(427, 82, 34, 4, "#78664f");
    rect(430, 69, 27, 3, "#78664f");
    rect(438, 73, 4, 19, "#b5ab91");
    rect(130, 173, 223, 13, urban ? "#b38b58" : "#c1a16b");
    for (let x = 139; x < 348; x += 17) rect(x, 176, 2, 7, x % 2 ? "#6d7c5f" : "#d7bd83");
  }

  function drawBedroomScene(location, hour, colors, seed, season, urban) {
    drawThaiRoomBase(location, hour, "bedroom", urban);
    rect(263, 112, 181, 42, "#554c55");
    rect(270, 102, 167, 43, "#d5cfbb");
    rect(280, 107, 61, 17, "#a3bac0");
    rect(344, 108, 85, 34, hour < 6 || hour >= 20 ? "#50647c" : "#b5a17f");
    for (let i = 0; i < 6; i++) rect(349 + i * 13, 114 + (i % 2) * 10, 8, 7, i % 2 ? "#b57b70" : "#d6c385");
    rect(259, 148, 190, 8, "#8d6a4d");
    rect(273, 156, 11, 21, "#604a3d");
    rect(426, 156, 11, 21, "#604a3d");
    rect(32, 43, 82, 105, "#79573e");
    rect(39, 50, 68, 91, "#d1b982");
    rect(44, 57, 58, 4, "#785b43");
    rect(44, 83, 58, 4, "#785b43");
    rect(44, 110, 58, 4, "#785b43");
    rect(51, 66, 17, 14, "#e5e0d3");
    rect(73, 66, 21, 14, "#5b6e87");
    rect(52, 93, 39, 14, "#c17b67");
    rect(228, 115, 24, 31, "#735341");
    rect(222, 108, 36, 8, "#9c7652");
    rect(230, 101, 20, 8, "#f0d88f");
    rect(236, 106, 8, 7, "#fff0b4");
    rect(112, 154, 48, 28, "#556573");
    rect(117, 159, 38, 18, "#c9d4d0");
    rect(121, 162, 30, 12, "#83a3a0");
    rect(310, 158, 16, 5, "#b78c66");
    rect(335, 158, 16, 5, "#b78c66");
    rect(170, 45, 58, 12, "#806c55");
    rect(179, 48, 41, 6, "#ecdfbf");
  }

  function drawThaiFoodStall(location, hour, colors, seed, urban) {
    drawThaiLocation(location, hour, colors, seed, 0, urban);
    rect(0, 122, 480, 78, "#484149");
    rect(22, 43, 218, 10, "#62463e");
    for (let i = 0; i < 6; i++) rect(28 + i * 35, 52, 32, 45, ["#d77c62", "#e1bd78", "#709184"][i % 3]);
    rect(21, 94, 222, 12, "#76533f");
    rect(31, 106, 11, 45, "#59473d");
    rect(222, 106, 11, 45, "#59473d");
    rect(251, 81, 90, 57, "#4d4849");
    rect(258, 89, 75, 43, "#b77c53");
    rect(269, 96, 54, 7, "#d9c28f");
    rect(276, 105, 41, 4, "#a65046");
    rect(283, 113, 34, 4, "#699054");
    rect(369, 88, 13, 38, "#d19e69");
    rect(385, 94, 14, 32, "#d79c60");
    rect(404, 85, 14, 41, "#d2b47e");
    rect(365, 126, 60, 9, "#d3b98a");
    rect(38, 159, 90, 8, "#9b604d");
    rect(43, 167, 9, 22, "#3d3941");
    rect(111, 167, 9, 22, "#3d3941");
    rect(344, 152, 83, 8, "#99604c");
    rect(351, 160, 8, 24, "#3d3941");
    rect(411, 160, 8, 24, "#3d3941");
  }

  function drawThaiPark(location, hour, colors, seed, urban) {
    drawThaiLocation(location, hour, colors, seed, 0, urban);
    rect(0, 123, 480, 77, "#609265");
    rect(0, 164, 480, 36, "#cfb285");
    rect(0, 164, 480, 7, "#e3d3a8");
    rect(43, 58, 13, 81, "#74533e");
    rect(24, 48, 56, 10, "#74533e");
    for (const [x, y, w, color] of [[11, 39, 64, "#56835a"], [35, 30, 68, "#67945f"], [66, 43, 54, "#497b53"], [390, 47, 68, "#56835a"], [414, 34, 62, "#6b955f"]]) rect(x, y, w, 17, color);
    rect(163, 132, 8, 29, "#806048");
    rect(207, 132, 8, 29, "#806048");
    rect(151, 126, 76, 7, "#d3a96d");
    rect(150, 126, 8, 28, "#ae7651");
    rect(225, 126, 8, 28, "#ae7651");
    rect(306, 122, 9, 36, "#715640");
    rect(290, 117, 44, 8, "#8eaa73");
    rect(345, 145, 38, 17, "#9fc0be");
    rect(351, 140, 25, 6, "#e9e3d0");
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
      drawLivingRoomScene(location, hour, colors, seed, season, urban, state.age);
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

  const heroPixels = [
    "......KKKK......",
    "....KKHHHHKK....",
    "...KHHHHHHHHK...",
    "...KHHKKHHKKHK..",
    "...KKSSSSSSKK...",
    "..KSSSESSSESSSK.",
    "..KSSSKSSSKSSSK.",
    "...KSSSSMSSSK...",
    "....KKKKKKKK....",
    ".......SSS......",
    "....KKCCCCCCKK....",
    "...KCCCCCCCCCCK...",
    "..KKACCCCCCCCAKK..",
    "..KACCCWWCCCAK....",
    "..KACCCCCCCCAK....",
    "..KACCCWCCCAK.....",
    "..KACCCCCCCCAK....",
    "..KACCCCCCCCAK....",
    "...KKCCCCCCKK.....",
    "....KKCCCCCCK.....",
    ".....KKPPKK.....",
    ".....KPPPPK.....",
    ".....KPPPPK.....",
    ".....KPPPPK.....",
    "...KKKPPPPKKK...",
    "...KPPPPPPPPK...",
    "...KPPPPPPPPK...",
    "...KPPPP..PPK...",
    "...KPPPP..PPK...",
    "..KKPP....PPKK..",
    "..KBB......BBK..",
    "..KK........KK..",
  ];
  const seatedLegs = [
    ".....KKPPKK.....",
    "....KKPPPPKK....",
    "...KKPP..PPKK...",
    "...KPP....PPK...",
    "..KKBB....BBKK..",
    "..KBB......BBK..",
  ];
  const babyPixels = [
    "......HHHH......",
    "....HHHHHHHH....",
    "...HHKKHHKKHH...",
    "..HKHHHHHHHHKH..",
    "..KKSSSSSSSSKK..",
    ".KSSSEEESSEESSSK.",
    ".KSSSEKSSSKE SSK.",
    "..KSSSSMMMMSSK...",
    "...KKKKKKKK......",
    ".....SSSS.........",
    "...KKCCCCKK.......",
    "..KCCCCCCCCK......",
    "...KCCCCCCK.......",
    "....KKKKKK........",
  ].map((row) => row.replaceAll(" ", ""));
  const sleepingPixels = [
    "........................HHHHHHHH........",
    ".....................HHHHHHHHHHHH.......",
    "....................KKSSSSSSSSSSKK.......",
    "...................KSSSSSEEESSESSSK......",
    "...................KSSSSSSMMMMSSSSK......",
    "....................KKKKKKKKKKKKKK........",
    "...KKKKKKKKKKKKKKKKKKCCCCCCCCCCCCCCKK.....",
    "..KWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWK....",
    ".KWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWK...",
    "..KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK....",
  ];

  function pixelColorMap(state) {
    const look = state.character || {};
    const age = Number(state.age || 0);
    const kind = state.activity?.kind || "home";
    const student = (kind === "study" || state.event?.scene === "wai-khru") && age >= 6 && age < 18;
    const doctor = kind === "work" && /แพทย์|พยาบาล|สุขภาพ|หมอ/.test(state.job || "");
    const songkran = state.event?.scene === "songkran";
    const shirt = student ? "#eee9db" : doctor ? "#8bbcaf" : songkran ? "#e7bc73" : look.shirt || "#8e9fc8";
    const pants = student ? "#36486c" : "#485373";
    const shade = (hex, amount) => {
      const value = Number.parseInt(hex.slice(1), 16);
      const channels = [value >> 16, (value >> 8) & 255, value & 255]
        .map((channel) => Math.max(0, Math.min(255, channel + amount)));
      return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
    };
    return {
      K: "#302b43",
      H: age >= 62 ? "#c1b8a1" : look.hair || (age < 24 ? "#292b43" : age < 50 ? "#4b3747" : "#797064"),
      h: shade(look.hair || "#40374d", 35),
      S: look.skin || "#e8ad8c",
      s: shade(look.skin || "#e8ad8c", -27),
      E: "#fff1d0",
      M: "#a65d68",
      C: shirt,
      c: shade(shirt, -30),
      W: shade(shirt, 28),
      P: pants,
      p: shade(pants, 24),
      B: "#282c41",
      A: look.skin || "#e8ad8c",
      G: "#bf8960",
      R: "#bf5d5c",
      T: "#f3d995",
    };
  }

  function drawPixelMap(rows, centerX, bottomY, pixel, colors, bob = 0) {
    const width = Math.max(...rows.map((row) => row.length));
    const originX = Math.round(centerX - (width * pixel) / 2);
    const originY = Math.round(bottomY - rows.length * pixel + bob);
    rows.forEach((row, y) => {
      const offset = Math.floor((width - row.length) / 2);
      for (let x = 0; x < row.length; x++) {
        const color = colors[row[x]];
        if (color) rect(originX + (offset + x) * pixel, originY + y * pixel, pixel, pixel, color);
      }
    });
  }

  function drawPixelCharacter(x, floor, state, frame) {
    const age = Number(state.age || 0);
    const kind = state.activity?.kind || "home";
    const look = state.character || {};
    const colors = pixelColorMap(state);
    const scale = age < 6 ? 2.2 : age < 13 ? 2.4 : age < 17 ? 2.65 : 2.85;
    const walking = ["commute", "travel"].includes(kind);
    const bob = walking && frame ? -2 : 0;
    if (kind === "rest") {
      drawPixelMap(sleepingPixels, x + 4, floor - 20, 3, colors, frame ? 1 : 0);
      return;
    }
    if (age < 1.5) {
      const babyColors = { ...colors, C: look.shirt || "#9ab29b", c: "#718f7a", W: "#d9cfab", P: "#74899c", p: "#9eb0b7" };
      drawPixelMap(babyPixels, x, floor + 1, 2.5, babyColors);
      rect(x - 31, floor - 8, 62, 6, "#6f594d");
      rect(x - 26, floor - 4, 6, 7, "#765c4c");
      rect(x + 20, floor - 4, 6, 7, "#765c4c");
      return;
    }
    const rows = state.seated
      ? heroPixels.slice(0, 20).concat(seatedLegs)
      : heroPixels;
    const pixel = scale;
    rect(x - 37, floor + 1, 74, 5, "#353545");
    drawPixelMap(rows, x, floor, pixel, colors, bob);

    const pixelAt = (dx, dy, color, w = pixel, h = pixel) => rect(x + dx, floor + dy, w, h, color);
    pixelAt(-pixel * 3, -pixel * 27, colors.K, pixel, pixel * 2);
    pixelAt(pixel, -pixel * 27, colors.K, pixel, pixel * 2);
    if (look.hairstyle === 1) {
      pixelAt(-pixel * 7, -pixel * 28, colors.H, pixel, pixel * 6);
      pixelAt(pixel * 6, -pixel * 28, colors.H, pixel, pixel * 6);
    } else if (look.hairstyle === 2) {
      pixelAt(-pixel * 7, -pixel * 31, colors.H, pixel * 3, pixel * 2);
      pixelAt(pixel * 4, -pixel * 31, colors.H, pixel * 3, pixel * 2);
    } else if (look.hairstyle === 3) {
      pixelAt(-pixel * 2, -pixel * 31, colors.H, pixel * 4, pixel * 2);
    }
    if (look.accessory === "glasses") {
      pixelAt(-pixel * 5, -pixel * 27, "#dfd4ba", pixel * 4, pixel * 2);
      pixelAt(pixel, -pixel * 27, "#dfd4ba", pixel * 4, pixel * 2);
      pixelAt(-pixel * 4, -pixel * 26, "#42556b", pixel * 3, pixel);
      pixelAt(pixel * 2, -pixel * 26, "#42556b", pixel * 3, pixel);
    }
    if (kind === "cook") {
      pixelAt(pixel * 5, -pixel * 17, colors.A, pixel * 4, pixel * 2);
      pixelAt(pixel * 8, -pixel * 18, colors.K, pixel, pixel * 4);
      pixelAt(pixel * 7, -pixel * 20, colors.p, pixel * 3, pixel);
      pixelAt(-pixel * 4, -pixel * 6, colors.W, pixel * 8, pixel * 7);
      pixelAt(-pixel * 3, -pixel * 4, colors.T, pixel * 6, pixel);
    } else if (kind === "exercise") {
      pixelAt(-pixel * 8, -pixel * 16, colors.A, pixel * 3, pixel * 6);
      pixelAt(-pixel * 9, -pixel * 18, colors.C, pixel * 3, pixel * 2);
      pixelAt(pixel * 5, -pixel * 16, colors.A, pixel * 3, pixel * 6);
      pixelAt(pixel * 5, -pixel * 18, colors.C, pixel * 3, pixel * 2);
    } else if (walking) {
      pixelAt(-pixel * 8, -pixel * 18, colors.K, pixel * 5, pixel * 10);
      pixelAt(-pixel * 7, -pixel * 17, colors.G, pixel * 3, pixel * 6);
      pixelAt(-pixel * 6, -pixel * 14, colors.T, pixel * 2, pixel);
    } else if (kind === "work" && /แพทย์|พยาบาล|สุขภาพ|หมอ/.test(state.job || "")) {
      pixelAt(-pixel, -pixel * 15, colors.R, pixel * 2, pixel * 5);
      pixelAt(-pixel * 2, -pixel * 14, colors.R, pixel * 4, pixel * 2);
    }
    if (state.event?.scene === "songkran") {
      pixelAt(-pixel * 4, -pixel * 18, colors.R);
      pixelAt(pixel * 3, -pixel * 17, colors.T);
      pixelAt(pixel * 6, -pixel * 15, colors.W);
      pixelAt(-pixel * 6, -pixel * 13, colors.W);
    }
    if (state.seated) {
      pixelAt(-pixel * 3, -pixel * 5, colors.A, pixel * 4, pixel * 2);
      pixelAt(pixel, -pixel * 5, colors.A, pixel * 4, pixel * 2);
    }
  }

  function drawAnimeCharacter(x, floor, state, frame) {
    drawPixelCharacter(x, floor, state, frame);
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
    } else if (kind === "exercise") {
      drawThaiPark(location, hour, colors, seed, urban);
    } else if (kind === "lunch") {
      drawThaiFoodStall(location, hour, colors, seed, urban);
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
    if (!eventScene && state.age < 1.5 && ["family", "home"].includes(kind)) {
      rect(188, 156, 4, 15, "#92724f");
      rect(295, 156, 4, 15, "#92724f");
      for (let x = 199; x < 291; x += 11) rect(x, 155, 3, 14, "#a4825c");
      rect(185, 153, 122, 4, "#d2b27c");
    }
    // Foreground highlights make the scene feel like a framed anime game cutaway.
    rect(0, 0, 480, 3, "#202b3d");
    rect(0, 197, 480, 3, "#202b3d");
  }

  window.LifeScene = Object.freeze({ draw });
})();
