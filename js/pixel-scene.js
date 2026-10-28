/* Pixel-art room scene: small, hand-drawn shapes keep the image crisp at every size. */
(() => {
  const canvas = document.getElementById("activityCanvas");
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const colors = {
    ink: "#263238",
    wall: "#26343a",
    wallLight: "#33434a",
    trim: "#61706b",
    floor: "#775b49",
    floorLight: "#9a7958",
    wood: "#80593f",
    skin: "#c9916d",
    hair: "#30271f",
    shirt: "#6c82a2",
    pants: "#37444c",
    leaf: "#76946a",
    paper: "#e5d4a4",
  };

  context.imageSmoothingEnabled = false;

  function pixel(x, y, w, h, color) {
    context.fillStyle = color;
    context.fillRect(
      Math.round(x),
      Math.round(y),
      Math.round(w),
      Math.round(h),
    );
  }

  function drawWindow(isNight, time, location) {
    const sky = isNight ? "#273b52" : "#91b9b1";
    pixel(28, 20, 242, 133, "#1e292d");
    pixel(35, 27, 228, 119, "#b4c5b4");
    pixel(41, 33, 216, 108, sky);

    if (isNight) {
      for (let i = 0; i < 14; i++) {
        const x = 48 + ((i * 37) % 200);
        const y = 39 + ((i * 19) % 46);
        if ((Math.floor(time / 700) + i) % 3 !== 0)
          pixel(x, y, 2, 2, "#f3e8b8");
      }
      pixel(202, 42, 15, 15, "#e5dca3");
      pixel(207, 38, 13, 16, sky);
    } else {
      const cloudX = 48 + ((time / 50) % 155);
      pixel(cloudX, 50, 25, 5, "#d9e2cf");
      pixel(cloudX + 6, 45, 15, 5, "#d9e2cf");
      pixel(198, 42, 17, 17, "#f1d786");
    }

    const seed = (location?.country || "world")
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    for (let i = 0; i < 8; i++) {
      const buildingWidth = 17 + ((seed + i * 7) % 11);
      const buildingHeight = 21 + ((seed * (i + 3)) % 48);
      const x = 43 + i * 26;
      const y = 140 - buildingHeight;
      pixel(
        x,
        y,
        buildingWidth,
        buildingHeight,
        isNight ? "#3c4d5b" : "#77958a",
      );
      pixel(x, y, buildingWidth, 3, isNight ? "#536270" : "#93aa97");
      for (let row = y + 8; row < 136; row += 12) {
        for (let col = x + 4; col < x + buildingWidth - 3; col += 8) {
          if (isNight && (row + col + i) % 3 !== 0)
            pixel(col, row, 3, 4, "#f0cb7c");
          else if (!isNight) pixel(col, row, 3, 4, "#aac3b0");
        }
      }
    }

    pixel(143, 30, 6, 111, "#33413d");
    pixel(40, 84, 218, 5, "#33413d");
    pixel(30, 143, 238, 8, "#594b3c");
    pixel(33, 146, 232, 3, "#d5c29a");
  }

  function drawRoom(isNight, time) {
    pixel(0, 0, width, height, colors.wall);
    pixel(0, 0, width, 8, "#202a2e");
    pixel(0, 8, width, 4, "#46534f");
    for (let x = 10; x < width; x += 32) pixel(x, 13, 1, 137, "#2d3b3e");

    drawWindow(isNight, time, currentLocation);

    // A framed landscape and a narrow bookshelf make the room feel lived in.
    pixel(290, 35, 75, 52, "#171f22");
    pixel(295, 40, 65, 42, "#92765b");
    pixel(300, 45, 55, 32, "#9ebcb0");
    pixel(300, 62, 55, 15, "#6e8a77");
    pixel(310, 55, 15, 7, "#e2c887");
    pixel(339, 46, 12, 12, "#d7b58a");

    pixel(376, 62, 47, 82, "#614837");
    pixel(380, 66, 39, 4, "#a4805d");
    pixel(380, 99, 39, 4, "#a4805d");
    pixel(380, 132, 39, 4, "#a4805d");
    const books = ["#c57967", "#d3b771", "#6f927f", "#849ab1", "#d59a70"];
    books.forEach((color, i) =>
      pixel(383 + i * 7, 76 + (i % 2) * 2, 5, 20 - (i % 2) * 3, color),
    );
    pixel(385, 108, 27, 18, "#b2a37d");
    pixel(389, 111, 19, 12, "#617f75");

    // Wall light changes with the room's day/night cycle.
    pixel(404, 24, 5, 43, "#9a8b67");
    pixel(394, 21, 25, 8, isNight ? "#f4d98a" : "#dfc988");
    pixel(398, 29, 17, 4, isNight ? "#d8bd75" : "#bdac7b");
    if (isNight && Math.floor(time / 500) % 2 === 0)
      pixel(398, 31, 17, 2, "#fff0b5");

    // Floorboards and rug add texture without softening the pixel edges.
    pixel(0, 153, width, 87, colors.floor);
    pixel(0, 153, width, 5, "#c4a878");
    for (let y = 173; y < height; y += 21) {
      pixel(0, y, width, 2, "#674e40");
      for (let x = (y % 3) * 31; x < width; x += 125)
        pixel(x, y - 15, 2, 16, "#89694f");
    }
    pixel(119, 180, 185, 45, "#5d5142");
    pixel(124, 184, 175, 35, "#816b50");
    pixel(129, 189, 165, 2, "#b29a70");

    // A plant in the corner subtly moves when the room changes activity.
    pixel(703, 128, 9, 29, "#75583f");
    pixel(695, 141, 25, 12, "#a98057");
    pixel(690, 102, 18, 24, colors.leaf);
    pixel(706, 89, 19, 35, "#80a071");
    pixel(719, 106, 23, 20, "#90a978");
    if (Math.floor(time / 450) % 2 === 0) pixel(685, 113, 12, 7, "#8ca878");

    // Door and coat hooks at the far edge of the room.
    pixel(746, 26, 22, 130, "#202a2c");
    pixel(751, 31, 15, 119, "#765640");
    pixel(754, 37, 10, 108, "#876346");
    pixel(760, 92, 3, 3, "#e1c580");
    pixel(739, 42, 3, 18, "#b09b68");
    pixel(735, 44, 8, 3, "#c5ac73");
  }

  function drawDesk(activity, isNight, time) {
    const isCooking = ["cook", "care"].includes(activity.kind);
    const isResting = ["family", "social", "rest"].includes(activity.kind);
    if (isCooking) {
      pixel(435, 119, 195, 13, "#52645e");
      pixel(435, 131, 195, 7, "#b58f5c");
      pixel(448, 138, 8, 32, "#76583f");
      pixel(610, 138, 8, 32, "#76583f");
      pixel(455, 89, 66, 28, "#8b694a");
      pixel(460, 94, 56, 18, "#bdac83");
      pixel(551, 100, 31, 17, "#41504c");
      pixel(555, 94, 23, 7, "#aeb69a");
      pixel(573, 81, 5, 19, "#e6d8aa");
      pixel(577, 78, 2, 19, "#e6d8aa");
      if (Math.floor(time / 280) % 2 === 0) {
        pixel(563, 72, 3, 6, "#e6e1cd");
        pixel(571, 68, 3, 6, "#e6e1cd");
      }
      pixel(590, 108, 19, 8, "#d3ba7c");
      pixel(592, 103, 13, 5, "#75956b");
      return { x: 520, floorY: 180, seated: false, activity };
    }

    if (isResting) {
      pixel(434, 138, 196, 20, "#58635c");
      pixel(445, 115, 163, 33, "#778778");
      pixel(438, 149, 12, 27, "#5b493b");
      pixel(612, 149, 12, 27, "#5b493b");
      pixel(454, 121, 47, 18, "#d0b78b");
      pixel(506, 120, 57, 18, "#9aaf9a");
      pixel(623, 122, 21, 46, "#7b6145");
      pixel(618, 117, 31, 8, "#d0b278");
      pixel(625, 106, 17, 11, isNight ? "#f0d990" : "#e5c987");
      return { x: 526, floorY: 180, seated: true, activity };
    }

    if (["commute", "travel", "shop"].includes(activity.kind)) {
      pixel(675, 162, 16, 17, "#a26a50");
      pixel(671, 179, 24, 4, "#4a4140");
      pixel(678, 166, 10, 6, "#d4bd81");
      pixel(646, 40, 4, 18, "#b09b68");
      pixel(642, 43, 11, 3, "#c5ac73");
      return { x: 646, floorY: 180, seated: false, activity };
    }

    if (["exercise", "garden"].includes(activity.kind)) {
      pixel(452, 178, 147, 5, "#d09c68");
      pixel(461, 174, 122, 3, "#e0bb80");
      pixel(605, 118, 15, 40, "#805f43");
      pixel(599, 116, 26, 5, "#c09d68");
      pixel(606, 101, 11, 15, "#6d8d63");
      pixel(615, 95, 13, 19, "#86a374");
      return { x: 521, floorY: 180, seated: false, activity };
    }

    // Study, work and reading use the same small desk, with different objects.
    pixel(425, 136, 211, 10, "#80563c");
    pixel(438, 146, 9, 38, "#5d4838");
    pixel(615, 146, 9, 38, "#5d4838");
    pixel(475, 104, 82, 31, "#34444a");
    pixel(481, 109, 70, 21, isNight ? "#91afae" : "#a8c8b6");
    pixel(487, 112, 51, 2, "#718d82");
    pixel(487, 117, 28, 2, "#718d82");
    pixel(510, 134, 18, 3, "#34444a");
    pixel(570, 124, 26, 11, "#dec990");
    pixel(575, 120, 18, 4, "#627962");
    pixel(603, 127, 16, 8, "#9b644c");
    pixel(606, 124, 10, 3, "#e4d3a2");
    pixel(447, 110, 5, 26, "#b6a777");
    pixel(438, 103, 22, 7, isNight ? "#f2dc98" : "#d8c48d");
    return { x: 522, floorY: 180, seated: true, activity };
  }

  function drawAvatar(
    x,
    floorY,
    { seated, age, action, frame, color = colors.shirt, small = false },
  ) {
    const scale = small ? 0.68 : 1;
    const pixelSize = (left, top, w, h, fill) =>
      pixel(x + left * scale, floorY + top * scale, w * scale, h * scale, fill);
    const bob = frame ? -1 : 0;
    pixel(x - 15 * scale, floorY - 2 * scale, 30 * scale, 4 * scale, "#514638");
    pixelSize(-8, -49 + bob, 17, 18, colors.skin);
    pixelSize(-10, -54 + bob, 21, 8, colors.hair);
    pixelSize(-11, -48 + bob, 5, 11, colors.hair);
    pixelSize(5, -44 + bob, 5, 3, "#332821");
    pixelSize(-7, -29 + bob, 15, 22, color);
    pixelSize(-8, -11 + bob, 7, 14, colors.pants);
    pixelSize(2, -11 + bob, 7, 14, colors.pants);

    if (seated) {
      pixelSize(-12, -8 + bob, 17, 6, colors.pants);
      pixelSize(0, -8 + bob, 14, 6, colors.pants);
      pixelSize(7, -4 + bob, 10, 4, "#292d2d");
      pixelSize(-2, -4 + bob, 10, 4, "#292d2d");
      const armLift = frame ? 3 : 0;
      pixelSize(-13, -27 + bob, 6, 16, colors.skin);
      pixelSize(7, -27 + bob + armLift, 7, 14, colors.skin);
      if (action.kind === "study" || action.kind === "work")
        pixelSize(7, -14 + bob, 10, 4, colors.skin);
    } else {
      const step = frame ? 3 : 0;
      pixelSize(-13, -28 + bob, 6, 16, colors.skin);
      pixelSize(8, -28 + bob + step, 6, 16, colors.skin);
      pixelSize(-8, 1 + bob - step, 7, 13, colors.pants);
      pixelSize(2, 1 + bob + step, 7, 13, colors.pants);
      pixelSize(-9, 13 + bob - step, 9, 4, "#292d2d");
      pixelSize(1, 13 + bob + step, 10, 4, "#292d2d");
    }
  }

  function draw(timestamp, state) {
    const { activity, age, location, family } = state;
    const nightPhase = (timestamp % 26000) / 26000;
    const isNight = nightPhase > 0.72 || nightPhase < 0.12;
    const frame = Math.floor(timestamp / 320) % 2;
    currentLocation = location;

    drawRoom(isNight, timestamp);
    const avatar = drawDesk(activity, isNight, timestamp);
    const shirtColor = age < 24 ? "#6c82a2" : age < 45 ? "#668a71" : "#857b62";
    drawAvatar(avatar.x, avatar.floorY, {
      seated: avatar.seated,
      age,
      action: activity,
      frame,
      color: shirtColor,
    });

    if (family?.partner && ["family", "cook", "care"].includes(activity.kind)) {
      drawAvatar(592, 180, {
        seated: activity.kind === "family",
        age,
        action: activity,
        frame: 1 - frame,
        color: "#b76d64",
        small: family.children > 0,
      });
    }

    if (isNight) {
      pixel(5, 7, width - 10, 2, "#526065");
      pixel(5, height - 3, width - 10, 3, "#242d31");
    }
  }

  let currentLocation = null;
  window.LifeScene = Object.freeze({ draw });
})();
