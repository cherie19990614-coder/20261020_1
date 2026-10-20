// p5.js 響應式全螢幕拖曳題測驗系統 - 動物辨識版 (sketch.js)
// 包含 6 個題目：上方為動物特徵視覺動畫，下方為可拖曳的文字選項
// 具備響應式排版、交卷計分系統，以及成績高於 60% 時的滿版彩蛋慶祝效果

// 宣告全域變數
let questions = []; // 儲存 6 個題目的資料
let options = []; // 儲存下方所有拖曳選項的物件
let draggedOption = null; // 目前正在被滑鼠或觸控拖曳的選項
let submitButton; // 交卷按鈕
let resultMessage = ""; // 顯示的最終成績與結果
let quizSubmitted = false; // 判斷是否已經按過交卷按鈕
let isPassed = false; // 判斷成績是否高於 60%（用於觸發彩蛋）
let confettiParticles = []; // 存放彩蛋特效（碎紙花/粒子）的陣列

function setup() {
  // 建立全螢幕響應式畫布，大小隨瀏覽器視窗改變
  createCanvas(windowWidth, windowHeight);
  
  // 初始化 6 個動物辨識相關的題目
  questions = [
    { id: 1, title: "1. 萬獸之王（特徵：濃密鬃毛）", answer: "獅子" },
    { id: 2, title: "2. 黑白相間（特徵：條紋身軀）", answer: "斑馬" },
    { id: 3, title: "3. 陸地巨獸（特徵：長鼻子）", answer: "大象" },
    { id: 4, title: "4. 百獸之王（特徵：橘黑條紋）", answer: "老虎" },
    { id: 5, title: "5. 縱橫草原（特徵：長脖子與斑點）", answer: "長頸鹿" },
    { id: 6, title: "6. 南極紳士（特徵：搖搖擺擺走路）", answer: "企鵝" }
  ];

  // 初始化下方可拖曳的文字選項（隨機打亂順序）
  let optionTexts = [
    "獅子",
    "斑馬",
    "大象",
    "老虎",
    "長頸鹿",
    "企鵝"
  ];
  
  optionTexts = shuffle(optionTexts);

  // 初始化選項物件（初始位置會透過 windowResized 統一計算配置）
  for (let i = 0; i < optionTexts.length; i++) {
    options.push({
      text: optionTexts[i],
      x: 0,
      y: 0,
      origX: 0,
      origY: 0,
      w: 220,
      h: 45,
      assignedQuestionId: null // null 代表目前在備選區
    });
  }

  // 建立「交卷看成績」按鈕
  submitButton = createButton('交卷看成績');
  submitButton.size(140, 45);
  submitButton.style('font-size', '16px');
  submitButton.style('font-weight', 'bold');
  submitButton.style('background-color', '#4CAF50');
  submitButton.style('color', 'white');
  submitButton.style('border', 'none');
  submitButton.style('border-radius', '8px');
  submitButton.style('cursor', 'pointer');
  submitButton.style('box-shadow', '0 4px 6px rgba(0,0,0,0.1)');
  submitButton.mousePressed(calculateScore); // 點擊按鈕時觸發計分函式

  // 根據當前視窗大小初始化排版位置
  updateLayoutPositions();
}

function draw() {
  // 設定畫布背景顏色為極淺藍灰色
  background(240, 244, 248);

  // 繪製頂部標題與操作說明（響應式置中）
  drawHeader();

  // 繪製上方 6 個題目卡片與放置目標槽
  drawQuestionSlots();

  // 繪製下方備選區與可拖曳選項
  drawDraggableOptions();

  // 如果成績及格（> 60%），持續更新與繪製彩蛋粒子特效
  if (quizSubmitted && isPassed) {
    updateAndDrawConfetti();
  }

  // 如果已經交卷，顯示最終結算成績彈跳視窗
  if (quizSubmitted) {
    displayResult();
  }
}

// 繪製頂部標題列
function drawHeader() {
  fill(30, 40, 60);
  noStroke();
  textSize(min(width * 0.025, 26));
  textAlign(CENTER, CENTER);
  text("🦁 動物辨識響應式互動拖曳測驗系統 🐧", width / 2, 35);
  
  textSize(min(width * 0.015, 15));
  fill(100, 110, 125);
  text("請觀察動畫特徵，將下方的動物名稱拖曳至上方對應空格中", width / 2, 65);
}

// 繪製上方 6 個題目與放置答案的目標框
function drawQuestionSlots() {
  let layout = getLayoutConfig();
  let cols = layout.cols;
  let startX = layout.startX;
  let startY = layout.startY;
  let boxW = layout.boxW;
  let boxH = layout.boxH;
  let spacingX = layout.spacingX;
  let spacingY = layout.spacingY;

  for (let i = 0; i < questions.length; i++) {
    let col = i % cols;
    let row = Math.floor(i / cols);
    let x = startX + col * (boxW + spacingX);
    let y = startY + row * (boxH + spacingY);

    // 繪製題目卡片外框
    fill(255);
    stroke(210, 220, 230);
    strokeWeight(1.5);
    rect(x, y, boxW, boxH, 10);

    // 繪製題目文字標題
    fill(20, 90, 180);
    noStroke();
    textSize(14);
    textAlign(LEFT, TOP);
    text(questions[i].title, x + 15, y + 12);

    // 繪製上方動物動畫展演區（模擬動畫效果）
    fill(248, 250, 252);
    stroke(225, 230, 238);
    rect(x + 15, y + 38, boxW - 30, boxH - 95, 6);
    
    // 呼叫動物視覺動畫模擬函式
    drawAnimalAnimation(i, x + 15, y + 38, boxW - 30, boxH - 95);

    // 繪製放置選項的目標框（Drop Zone）
    let dropY = y + boxH - 50;
    fill(235, 242, 250);
    stroke(170, 195, 225);
    rect(x + 15, dropY, boxW - 30, 38, 6);

    // 檢查是否有選項被放置在此題目槽內
    let assignedOpt = options.find(opt => opt.assignedQuestionId === questions[i].id);
    if (assignedOpt) {
      fill(30, 50, 80);
      noStroke();
      textSize(13);
      textAlign(CENTER, CENTER);
      text(assignedOpt.text, x + boxW / 2, dropY + 19);
    } else {
      fill(140, 150, 165);
      noStroke();
      textSize(12);
      textAlign(CENTER, CENTER);
      text("請將選項拖曳至此", x + boxW / 2, dropY + 19);
    }
  }
}

// 繪製下方備選區的文字選項
function drawDraggableOptions() {
  let layout = getLayoutConfig();
  let areaX = 30;
  let areaY = layout.optionsAreaY;
  let areaW = width - 60;
  let areaH = layout.optionsAreaH;

  // 繪製下方備選區背景框
  fill(225, 232, 240);
  stroke(200, 210, 220);
  rect(areaX, areaY, areaW, areaH, 12);

  fill(40, 50, 70);
  noStroke();
  textSize(15);
  textAlign(LEFT, TOP);
  text("【下方備選答案區】（請拖曳動物名稱至上方空格）", areaX + 20, areaY + 15);

  // 遍歷並繪製所有尚未指派的選項
  for (let i = 0; i < options.length; i++) {
    let opt = options[i];

    if (opt.assignedQuestionId !== null) continue; // 若已放入上方則跳過

    // 滑鼠懸停特效
    if (isMouseOverOption(opt)) {
      fill(210, 230, 255);
      stroke(30, 110, 220);
      strokeWeight(2);
    } else {
      fill(255);
      stroke(180, 195, 210);
      strokeWeight(1);
    }
    rect(opt.x, opt.y, opt.w, opt.h, 8);

    // 繪製選項文字
    fill(30, 40, 60);
    noStroke();
    textSize(14);
    textAlign(CENTER, CENTER);
    text(opt.text, opt.x + opt.w / 2, opt.y + opt.h / 2);
  }
}

// 滑鼠按下事件：判定是否點擊到某個選項準備進行拖曳
function mousePressed() {
  if (quizSubmitted) return; // 交卷後鎖定

  for (let i = 0; i < options.length; i++) {
    let opt = options[i];
    
    // 狀況 A：點擊備選區中的選項
    if (opt.assignedQuestionId === null && isMouseOverOption(opt)) {
      draggedOption = opt;
      break;
    }
    
    // 狀況 B：點擊已經放入上方題目槽的選項，允許拿出來重新配置
    if (opt.assignedQuestionId !== null) {
      let pos = getAssignedOptionPosition(opt.assignedQuestionId);
      if (pos && mouseX >= pos.x && mouseX <= pos.x + pos.w && mouseY >= pos.y && mouseY <= pos.y + pos.h) {
        opt.assignedQuestionId = null;
        draggedOption = opt;
        break;
      }
    }
  }
}

// 滑鼠拖曳中事件：讓選項跟隨滑鼠移動
function mouseDragged() {
  if (draggedOption) {
    draggedOption.x = mouseX - draggedOption.w / 2;
    draggedOption.y = mouseY - draggedOption.h / 2;
  }
}

// 滑鼠放開事件：判定是否放入上方的題目目標框中
function mouseReleased() {
  if (draggedOption) {
    let droppedInSlot = false;
    let layout = getLayoutConfig();
    let cols = layout.cols;
    let startX = layout.startX;
    let startY = layout.startY;
    let boxW = layout.boxW;
    let boxH = layout.boxH;
    let spacingX = layout.spacingX;
    let spacingY = layout.spacingY;

    for (let i = 0; i < questions.length; i++) {
      let col = i % cols;
      let row = Math.floor(i / cols);
      let x = startX + col * (boxW + spacingX);
      let y = startY + row * (boxH + spacingY);
      
      let dropY = y + boxH - 50;
      let dropZoneX = x + 15;
      let dropZoneW = boxW - 30;
      let dropZoneH = 38;

      // 檢查是否落在該題目的放置槽範圍內
      if (mouseX >= dropZoneX && mouseX <= dropZoneX + dropZoneW &&
          mouseY >= dropY && mouseY <= dropY + dropZoneH) {
        
        // 若該格子原本已有其他選項，先將原選項退回備選區
        let existingOpt = options.find(o => o.assignedQuestionId === questions[i].id);
        if (existingOpt) {
          existingOpt.assignedQuestionId = null;
          existingOpt.x = existingOpt.origX;
          existingOpt.y = existingOpt.origY;
        }

        // 綁定當前拖曳選項到此題目
        draggedOption.assignedQuestionId = questions[i].id;
        droppedInSlot = true;
        break;
      }
    }

    // 若未放入任何有效題目槽，退回原始備選位置
    if (!droppedInSlot) {
      draggedOption.assignedQuestionId = null;
      draggedOption.x = draggedOption.origX;
      draggedOption.y = draggedOption.origY;
    }

    draggedOption = null;
  }
}

// 計算分數並結算測驗
function calculateScore() {
  let correctCount = 0;
  let totalQuestions = questions.length;

  for (let i = 0; i < questions.length; i++) {
    let qId = questions[i].id;
    let correctAns = questions[i].answer;
    let opt = options.find(o => o.assignedQuestionId === qId);
    if (opt && opt.text === correctAns) {
      correctCount++;
    }
  }

  let percentage = (correctCount / totalQuestions) * 100;
  quizSubmitted = true;
  isPassed = percentage >= 60; // 判斷是否高於 60%

  // 若及格，初始化彩蛋慶祝粒子特效
  if (isPassed) {
    initConfetti();
  }

  // 設定結算對話框訊息
  if (isPassed) {
    resultMessage = `🎉 恭喜通關！\n你的總成績為：${percentage.toFixed(0)}% (${correctCount}/${totalQuestions} 題正確)\n太厲害了！你認出了大部分的動物！已解鎖彩蛋！`;
  } else {
    resultMessage = `📈 測驗完成\n你的總成績為：${percentage.toFixed(0)}% (${correctCount}/${totalQuestions} 題正確)\n成績低於 60%，再接再勵！請重新整理頁面再次挑戰。`;
  }
}

// 顯示最終結算成績彈跳視窗
function displayResult() {
  push();
  // 繪製半透明全螢幕遮罩
  fill(0, 0, 0, 160);
  rect(0, 0, width, height);

  // 彈跳視窗本體大小
  let modalW = min(width * 0.8, 500);
  let modalH = 240;
  let modalX = width / 2 - modalW / 2;
  let modalY = height / 2 - modalH / 2;

  fill(255);
  stroke(180, 200, 220);
  strokeWeight(2);
  rect(modalX, modalY, modalW, modalH, 14);

  // 視窗標題
  fill(20, 80, 160);
  noStroke();
  textSize(22);
  textAlign(CENTER, CENTER);
  text("📊 動物辨識測驗報告", width / 2, modalY + 45);

  // 視窗內容文字
  fill(40, 50, 70);
  textSize(16);
  textAlign(CENTER, CENTER);
  text(resultMessage, width / 2, modalY + 120);

  pop();
}

// 初始化彩蛋碎紙花粒子
function initConfetti() {
  confettiParticles = [];
  for (let i = 0; i < 150; i++) {
    confettiParticles.push({
      x: random(width),
      y: random(-height, 0),
      vx: random(-2, 2),
      vy: random(2, 6),
      size: random(8, 16),
      color: color(random(255), random(255), random(255)),
      shape: floor(random(3)), // 0: 圓形, 1: 方形, 2: 條形
      angle: random(TWO_PI),
      vAngle: random(-0.1, 0.1)
    });
  }
}

// 更新並繪製彩蛋粒子效果
function updateAndDrawConfetti() {
  push();
  noStroke();
  for (let p of confettiParticles) {
    p.x += p.vx;
    p.y += p.vy;
    p.angle += p.vAngle;

    // 若粒子掉落出畫面下方，則從上方重新落下
    if (p.y > height) {
      p.y = -20;
      p.x = random(width);
    }

    push();
    translate(p.x, p.y);
    rotate(p.angle);
    fill(p.color);

    if (p.shape === 0) {
      ellipse(0, 0, p.size, p.size);
    } else if (p.shape === 1) {
      rect(-p.size / 2, -p.size / 2, p.size, p.size);
    } else {
      rect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    }
    pop();
  }
  pop();
}

// 響應式佈局配置計算函式（適應不同螢幕寬高）
function getLayoutConfig() {
  let cols = width > 900 ? 3 : (width > 600 ? 2 : 1);
  let startX = 40;
  let startY = 90;
  let spacingX = 20;
  let spacingY = 15;
  
  let totalSpacingX = spacingX * (cols - 1);
  let boxW = (width - 80 - totalSpacingX) / cols;
  let boxH = 190;
  
  let rows = Math.ceil(questions.length / cols);
  let questionsBottomY = startY + rows * (boxH + spacingY);
  
  let optionsAreaY = max(questionsBottomY + 10, height - 210);
  let optionsAreaH = height - optionsAreaY - 20;

  return {
    cols: cols,
    startX: startX,
    startY: startY,
    boxW: boxW,
    boxH: boxH,
    spacingX: spacingX,
    spacingY: spacingY,
    optionsAreaY: optionsAreaY,
    optionsAreaH: optionsAreaH
  };
}

// 當瀏覽器視窗大小改變時自動重新計算版面與選項座標
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateLayoutPositions();
}

// 更新下方選項的座標與備選區排版
function updateLayoutPositions() {
  let layout = getLayoutConfig();
  let areaX = 50;
  let areaY = layout.optionsAreaY + 45;
  
  let startX = areaX;
  let startY = areaY;
  
  for (let i = 0; i < options.length; i++) {
    let opt = options[i];
    let col = i % 3;
    let row = Math.floor(i / 3);
    
    // 計算備選區排版位置
    opt.w = min(220, (width - 120) / 3);
    opt.h = 42;
    
    let posX = startX + col * (opt.w + 20);
    let posY = startY + row * (opt.h + 12);
    
    opt.origX = posX;
    opt.origY = posY;
    
    // 若選項目前在備選區，則更新其顯示座標
    if (opt.assignedQuestionId === null) {
      opt.x = posX;
      opt.y = posY;
    }
  }

  // 同步更新交卷按鈕位置（置中擺放於下方或底部邊緣）
  submitButton.position(width / 2 - 70, height - 55);
}

// 輔助函式：檢查滑鼠是否在選項範圍內
function isMouseOverOption(opt) {
  return mouseX >= opt.x && mouseX <= opt.x + opt.w && mouseY >= opt.y && mouseY <= opt.y + opt.h;
}

// 輔助函式：取得已指派選項在畫布上的實際座標
function getAssignedOptionPosition(qId) {
  let index = questions.findIndex(q => q.id === qId);
  if (index === -1) return null;

  let layout = getLayoutConfig();
  let cols = layout.cols;
  let startX = layout.startX;
  let startY = layout.startY;
  let boxW = layout.boxW;
  let boxH = layout.boxH;
  let spacingX = layout.spacingX;
  let spacingY = layout.spacingY;

  let col = index % cols;
  let row = Math.floor(index / cols);
  let x = startX + col * (boxW + spacingX);
  let y = startY + row * (boxH + spacingY);

  let dropY = y + boxH - 50;
  return {
    x: x + 15,
    y: dropY,
    w: boxW - 30,
    h: 38
  };
}

// 輔助函式：在每個題目上方繪製對應的動物動態特徵（繪圖視覺呈現）
function drawAnimalAnimation(index, x, y, w, h) {
  push();
  // 限制繪圖區域在卡片內部
  clip(() => {
    rect(x, y, w, h);
  });

  background(245, 250, 245);
  let t = millis() / 400; // 時間驅動變數
  let cx = x + w / 2;
  let cy = y + h / 2;

  if (index === 0) {
    // 1. 獅子（動態鬃毛與圓臉）
    stroke(200, 100, 20);
    strokeWeight(3);
    for (let a = 0; a < TWO_PI; a += PI / 6) {
      let r = 26 + sin(t + a * 2) * 4;
      line(cx, cy, cx + cos(a) * r, cy + sin(a) * r);
    }
    fill(230, 160, 50);
    noStroke();
    ellipse(cx, cy, 32, 32);
    fill(40);
    ellipse(cx - 6, cy - 3, 4, 4);
    ellipse(cx + 6, cy - 3, 4, 4);
    triangle(cx - 3, cy + 2, cx + 3, cy + 2, cx, cy + 6);
  } else if (index === 1) {
    // 2. 斑馬（動態黑白條紋）
    background(255);
    stroke(20);
    strokeWeight(6);
    let offset = (t * 15) % 20;
    for (let lx = x - 20 + offset; lx < x + w + 20; lx += 20) {
      line(lx, y, lx + 15, y + h);
    }
  } else if (index === 2) {
    // 3. 大象（灰色頭部與甩動的長鼻子）
    fill(160, 175, 190);
    noStroke();
    ellipse(cx - 18, cy - 5, 24, 28); // 左耳朵
    ellipse(cx + 18, cy - 5, 24, 28); // 右耳朵
    ellipse(cx, cy, 36, 32); // 頭部
    fill(40);
    ellipse(cx - 8, cy - 4, 4, 4);
    ellipse(cx + 8, cy - 4, 4, 4);
    
    // 動態甩鼻
    stroke(150, 165, 180);
    strokeWeight(8);
    noFill();
    beginShape();
    vertex(cx, cy + 4);
    vertex(cx + sin(t) * 12, cy + 20);
    vertex(cx + sin(t) * 18 + 5, cy + 30);
    endShape();
  } else if (index === 3) {
    // 4. 老虎（橘底黑斑紋特徵）
    background(245, 130, 30);
    stroke(30);
    strokeWeight(4);
    let stripeOffset = sin(t) * 8;
    line(cx - 35, cy - 20, cx - 15 + stripeOffset, cy - 10);
    line(cx + 35, cy - 20, cx + 15 - stripeOffset, cy - 10);
    line(cx - 40, cy + 5, cx - 20 + stripeOffset, cy + 10);
    line(cx + 40, cy + 5, cx + 20 - stripeOffset, cy + 10);
    fill(255);
    noStroke();
    textSize(11);
    textAlign(CENTER, CENTER);
    text("Tiger Stripes", cx, cy);
  } else if (index === 5) {
    // 6. 企鵝（黑白身體與黃嘴巴，搖搖擺擺）
    let swing = sin(t) * 0.15;
    translate(cx, cy + 8);
    rotate(swing);
    
    // 身體
    fill(30);
    noStroke();
    ellipse(0, 0, 32, 42);
    // 白肚子
    fill(255);
    ellipse(0, 4, 22, 30);
    // 眼睛
    fill(0);
    ellipse(-5, -10, 3, 3);
    ellipse(5, -10, 3, 3);
    // 嘴巴
    fill(255, 180, 0);
    triangle(-4, -6, 4, -6, 0, -1);
  } else if (index === 4) {
    // 5. 長頸鹿（黃底網狀斑點與伸長脖子動畫）
    background(240, 200, 80);
    fill(160, 82, 45);
    noStroke();
    rect(cx - 30, cy - 20, 20, 18, 4);
    rect(cx + 10, cy - 15, 22, 22, 5);
    rect(cx - 10, cy + 5, 25, 20, 4);
    
    // 伸長的脖子
    stroke(220, 180, 60);
    strokeWeight(12);
    let neckH = map(sin(t), -1, 1, 10, 30);
    line(cx + 30, cy + 25, cx + 30, cy + 25 - neckH);
  }

  pop();
}