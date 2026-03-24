const words = [
  {
    id: "apple",
    english: "apple",
    chinese: "苹果",
    image: "assets/images/apple.svg",
    level: "初中高频",
    theme: "食物",
    example: "I put an apple in my school bag for lunch.",
    tip: "把 apple 想成一颗红苹果，背完一组单词就奖励自己一口。",
    scene: "午餐盒里放着一颗红苹果，打开书包时一眼就能看到。"
  },
  {
    id: "bicycle",
    english: "bicycle",
    chinese: "自行车",
    image: "assets/images/bicycle.svg",
    level: "初中高频",
    theme: "日常出行",
    example: "He rides his bicycle to school on sunny days.",
    tip: "bi- 可以联想到 two，两只轮子就是 bicycle 最直观的线索。",
    scene: "放学路上骑车回家，车轮一转，单词也跟着转起来。"
  },
  {
    id: "library",
    english: "library",
    chinese: "图书馆",
    image: "assets/images/library.svg",
    level: "初中高频",
    theme: "校园",
    example: "We borrow story books from the library after class.",
    tip: "把 library 和一排排书架连起来，看到书本就想起这个词。",
    scene: "安静的图书馆里摆满故事书，适合和 reading room 一起记。"
  },
  {
    id: "bridge",
    english: "bridge",
    chinese: "桥",
    image: "assets/images/bridge.svg",
    level: "初中高频",
    theme: "自然与建筑",
    example: "A small bridge crosses the river behind the village.",
    tip: "bridge 就像把两边连接起来，也像把新单词和旧经验连接起来。",
    scene: "村口小河上有一座拱桥，走过去就到了另一边。"
  },
  {
    id: "forest",
    english: "forest",
    chinese: "森林",
    image: "assets/images/forest.svg",
    level: "初中高频",
    theme: "自然",
    example: "The forest becomes quiet after sunset.",
    tip: "想象一片密密的树，单词里每个字母都像竖起来的树干。",
    scene: "夕阳落下，森林安静下来，只剩风吹过树梢。"
  },
  {
    id: "courage",
    english: "courage",
    chinese: "勇气",
    image: "assets/images/courage.svg",
    level: "高中常用",
    theme: "情绪与品质",
    example: "It takes courage to speak English in front of the class.",
    tip: "把 courage 想成心里亮起的一面小旗子，提醒自己敢开口。",
    scene: "站在山顶举起旗子，虽然紧张，但还是向前迈了一步。"
  },
  {
    id: "whisper",
    english: "whisper",
    chinese: "低声说",
    image: "assets/images/whisper.svg",
    level: "高中常用",
    theme: "动作",
    example: "Please whisper in the reading room.",
    tip: "whisper 的声音像一阵很轻的气流，靠近耳边才听得见。",
    scene: "自习室里大家都很安静，只能贴近耳边小声提醒。"
  },
  {
    id: "puzzle",
    english: "puzzle",
    chinese: "谜题；拼图",
    image: "assets/images/puzzle.svg",
    level: "初中高频",
    theme: "学习活动",
    example: "This puzzle helps us remember new shapes.",
    tip: "把 puzzle 当成把零散信息拼起来的过程，就像记单词要拼出完整画面。",
    scene: "桌面上散着几块拼图，找到正确位置后画面才完整。"
  },
  {
    id: "journey",
    english: "journey",
    chinese: "旅程",
    image: "assets/images/journey.svg",
    level: "高中常用",
    theme: "旅行",
    example: "Our train journey to Beijing started early in the morning.",
    tip: "journey 想成一条一直向前的路，单词本身也有移动感。",
    scene: "清晨出发，阳光照在前方的路上，旅程正式开始。"
  },
  {
    id: "harvest",
    english: "harvest",
    chinese: "收获；收成",
    image: "assets/images/harvest.svg",
    level: "高中常用",
    theme: "季节与农业",
    example: "Farmers celebrate the rice harvest in autumn.",
    tip: "harvest 不只是农作物收成，也可以联想到学习后的成果。",
    scene: "秋天金黄的麦穗被收进篮子里，像把努力装满带走。"
  }
];

const state = {
  currentView: "welcome",
  learnIndex: 0,
  learnedSet: new Set([0]),
  reviewOrder: words.map((_, index) => index),
  reviewIndex: 0,
  reviewRevealed: false,
  reviewAnswers: [],
  reviewRatingsByWord: {},
  imageOrder: shuffle(words.map((_, index) => index)),
  imageIndex: 0,
  imageAnswered: false,
  imageScore: 0,
  imageAttempts: 0,
  imageChoices: [],
  imageLastCorrect: false
};

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindEvents();
  prepareImageQuestion();
  renderWelcome();
  renderLearn();
  renderReview();
  renderImage();
  renderStats();
  switchView("welcome");
});

function cacheElements() {
  elements.views = [...document.querySelectorAll(".view")];
  elements.navButtons = [...document.querySelectorAll("[data-target]")];
  elements.learnProgress = document.getElementById("learn-progress");
  elements.learnImage = document.getElementById("learn-image");
  elements.learnLevel = document.getElementById("learn-level");
  elements.learnWord = document.getElementById("learn-word");
  elements.learnTranslation = document.getElementById("learn-translation");
  elements.learnExample = document.getElementById("learn-example");
  elements.learnTip = document.getElementById("learn-tip");
  elements.learnScene = document.getElementById("learn-scene");
  elements.wordList = document.getElementById("word-list");
  elements.learnPrev = document.getElementById("learn-prev");
  elements.learnNext = document.getElementById("learn-next");
  elements.deckPreview = document.getElementById("deck-preview");
  elements.heroWordCount = document.getElementById("hero-word-count");

  elements.reviewProgress = document.getElementById("review-progress");
  elements.reviewImage = document.getElementById("review-image");
  elements.reviewWord = document.getElementById("review-word");
  elements.reviewExample = document.getElementById("review-example");
  elements.reviewTranslation = document.getElementById("review-translation");
  elements.reviewTip = document.getElementById("review-tip");
  elements.reviewAnswer = document.getElementById("review-answer");
  elements.reviewReveal = document.getElementById("review-reveal");
  elements.reviewSuggestion = document.getElementById("review-suggestion");
  elements.reviewCounts = {
    know: document.getElementById("count-know"),
    fuzzy: document.getElementById("count-fuzzy"),
    unknown: document.getElementById("count-unknown")
  };
  elements.rateButtons = [...document.querySelectorAll("[data-rating]")];

  elements.imageProgress = document.getElementById("image-progress");
  elements.imageVisual = document.getElementById("image-guess-visual");
  elements.imagePromptText = document.getElementById("image-prompt-text");
  elements.imageOptions = document.getElementById("image-options");
  elements.imageResult = document.getElementById("image-result");
  elements.imageNext = document.getElementById("image-next");
  elements.imageReset = document.getElementById("image-reset");

  elements.stats = {
    total: document.getElementById("stat-total"),
    learned: document.getElementById("stat-learned"),
    reviewed: document.getElementById("stat-reviewed"),
    imageAccuracy: document.getElementById("stat-image-accuracy"),
    reviewBars: document.getElementById("review-bars"),
    wordStatusList: document.getElementById("word-status-list")
  };
}

function bindEvents() {
  elements.navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.target;
      if (!target) {
        return;
      }

      switchView(target);
    });
  });

  elements.learnPrev.addEventListener("click", () => {
    if (state.learnIndex === 0) {
      return;
    }

    state.learnIndex -= 1;
    state.learnedSet.add(state.learnIndex);
    renderLearn();
    renderStats();
  });

  elements.learnNext.addEventListener("click", () => {
    if (state.learnIndex < words.length - 1) {
      state.learnIndex += 1;
    } else {
      state.learnIndex = 0;
    }

    state.learnedSet.add(state.learnIndex);
    renderLearn();
    renderStats();
  });

  elements.reviewReveal.addEventListener("click", () => {
    state.reviewRevealed = true;
    renderReview();
  });

  elements.rateButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!state.reviewRevealed || state.reviewIndex >= state.reviewOrder.length) {
        return;
      }

      const rating = button.dataset.rating;
      const wordIndex = state.reviewOrder[state.reviewIndex];

      state.reviewAnswers.push({ wordIndex, rating });
      state.reviewRatingsByWord[wordIndex] = rating;
      state.reviewIndex += 1;
      state.reviewRevealed = false;

      renderReview();
      renderStats();
    });
  });

  elements.imageOptions.addEventListener("click", (event) => {
    const button = event.target.closest(".option-btn");
    if (!button || state.imageAnswered || state.imageIndex >= state.imageOrder.length) {
      return;
    }

    const selectedIndex = Number(button.dataset.index);
    handleImageAnswer(selectedIndex);
  });

  elements.imageNext.addEventListener("click", () => {
    if (state.imageIndex < state.imageOrder.length - 1) {
      state.imageIndex += 1;
      state.imageAnswered = false;
      prepareImageQuestion();
    } else {
      state.imageIndex = state.imageOrder.length;
      state.imageAnswered = true;
    }

    renderImage();
    renderStats();
  });

  elements.imageReset.addEventListener("click", resetImageMode);
}

function switchView(viewId) {
  state.currentView = viewId;

  elements.views.forEach((view) => {
    view.classList.toggle("active", view.id === viewId);
  });

  document.querySelectorAll(".nav-pill").forEach((button) => {
    button.classList.toggle("active", button.dataset.target === viewId);
  });

  if (viewId === "stats") {
    renderStats();
  }
}

function renderWelcome() {
  elements.heroWordCount.textContent = String(words.length);
  elements.deckPreview.innerHTML = words
    .map(
      (word, index) => `
        <button class="word-chip ${index === state.learnIndex ? "active" : ""}" data-word-index="${index}">
          <span>
            <strong>${word.english}</strong>
            <small>${word.chinese}</small>
          </span>
          <small>${word.theme}</small>
        </button>
      `
    )
    .join("");

  attachWordJumpHandlers(elements.deckPreview);
}

function renderLearn() {
  const word = words[state.learnIndex];

  elements.learnProgress.textContent = `第 ${state.learnIndex + 1} / ${words.length} 张`;
  elements.learnImage.src = word.image;
  elements.learnImage.alt = `${word.english} illustration`;
  elements.learnLevel.textContent = `${word.level} · ${word.theme}`;
  elements.learnWord.textContent = word.english;
  elements.learnTranslation.textContent = word.chinese;
  elements.learnExample.textContent = word.example;
  elements.learnTip.textContent = word.tip;
  elements.learnScene.textContent = word.scene;

  elements.learnPrev.disabled = state.learnIndex === 0;
  elements.learnNext.textContent = state.learnIndex === words.length - 1 ? "回到第一张" : "下一张";

  elements.wordList.innerHTML = words
    .map(
      (item, index) => `
        <button class="word-chip ${index === state.learnIndex ? "active" : ""}" data-word-index="${index}">
          <span>
            <strong>${String(index + 1).padStart(2, "0")} ${item.english}</strong>
            <small>${item.chinese}</small>
          </span>
          <small>${state.reviewRatingsByWord[index] ? ratingLabel(state.reviewRatingsByWord[index]) : "未复习"}</small>
        </button>
      `
    )
    .join("");

  attachWordJumpHandlers(elements.wordList);
  renderWelcome();
}

function renderReview() {
  const counts = getReviewCounts();
  const total = state.reviewOrder.length;

  elements.reviewCounts.know.textContent = String(counts.know);
  elements.reviewCounts.fuzzy.textContent = String(counts.fuzzy);
  elements.reviewCounts.unknown.textContent = String(counts.unknown);
  elements.reviewProgress.textContent = `已完成 ${Math.min(state.reviewIndex, total)} / ${total}`;

  if (state.reviewIndex >= total) {
    const finalWord = words[state.reviewOrder[total - 1]];
    elements.reviewImage.src = finalWord.image;
    elements.reviewImage.alt = "review completed";
    elements.reviewWord.textContent = "本轮复习完成";
    elements.reviewExample.textContent = "可以切换到学习统计查看整体情况，或者重新开始图片联想模式。";
    elements.reviewTranslation.textContent = "今日复习已结束";
    elements.reviewTip.textContent = "继续把“模糊”和“不认识”的词拉回来，效果会更稳。";
    elements.reviewAnswer.classList.add("revealed");
    elements.reviewReveal.disabled = true;
    elements.rateButtons.forEach((button) => {
      button.disabled = true;
    });
    elements.reviewSuggestion.textContent = buildReviewSuggestion(counts);
    return;
  }

  const wordIndex = state.reviewOrder[state.reviewIndex];
  const word = words[wordIndex];

  elements.reviewImage.src = word.image;
  elements.reviewImage.alt = `${word.english} review illustration`;
  elements.reviewWord.textContent = word.english;
  elements.reviewExample.textContent = word.example;
  elements.reviewTranslation.textContent = word.chinese;
  elements.reviewTip.textContent = word.tip;
  elements.reviewAnswer.classList.toggle("revealed", state.reviewRevealed);
  elements.reviewReveal.disabled = state.reviewRevealed;
  elements.reviewSuggestion.textContent = buildReviewSuggestion(counts);

  elements.rateButtons.forEach((button) => {
    button.disabled = !state.reviewRevealed;
  });
}

function renderImage() {
  const total = state.imageOrder.length;
  const currentRound = Math.min(state.imageIndex + 1, total);
  const accuracy = state.imageAttempts === 0 ? 0 : Math.round((state.imageScore / state.imageAttempts) * 100);

  if (state.imageIndex >= total) {
    const finalWord = words[state.imageOrder[total - 1]];
    elements.imageProgress.textContent = `完成 ${total} / ${total}`;
    elements.imageVisual.src = finalWord.image;
    elements.imageVisual.alt = "image mode completed";
    elements.imagePromptText.textContent = "本轮看图猜词结束，可以重新开始再练一轮。";
    elements.imageOptions.innerHTML = "";
    elements.imageResult.innerHTML = `
      <strong>最终成绩：${state.imageScore} / ${state.imageAttempts}</strong>
      <p>命中率 ${accuracy}% 。建议回到学习卡片再看一遍抽象词。</p>
    `;
    elements.imageNext.disabled = true;
    return;
  }

  const word = words[state.imageOrder[state.imageIndex]];
  elements.imageProgress.textContent = `第 ${currentRound} / ${total} 题`;
  elements.imageVisual.src = word.image;
  elements.imageVisual.alt = `${word.english} image prompt`;
  elements.imagePromptText.textContent = "先根据画面做判断，再看反馈和记忆提示。";
  elements.imageOptions.innerHTML = state.imageChoices
    .map((choiceIndex) => {
      const item = words[choiceIndex];
      return `<button class="option-btn" data-index="${choiceIndex}">${item.english}</button>`;
    })
    .join("");

  if (!state.imageAnswered) {
    elements.imageResult.innerHTML = `<p>当前正确 ${state.imageScore} / ${state.imageAttempts}。试着用图像而不是翻译来回想单词。</p>`;
  } else {
    elements.imageResult.innerHTML = `
      <strong>${state.imageLastCorrect ? "答对了" : "这次没猜中"}</strong>
      <p>${word.english} · ${word.chinese}</p>
      <p>${word.tip}</p>
    `;
  }

  elements.imageNext.disabled = !state.imageAnswered;
  paintImageOptions();
}

function renderStats() {
  const counts = getReviewCounts();
  const reviewed = state.reviewAnswers.length;
  const accuracy = state.imageAttempts === 0 ? 0 : Math.round((state.imageScore / state.imageAttempts) * 100);

  elements.stats.total.textContent = String(words.length);
  elements.stats.learned.textContent = String(state.learnedSet.size);
  elements.stats.reviewed.textContent = String(reviewed);
  elements.stats.imageAccuracy.textContent = `${accuracy}%`;

  const totalForBars = Math.max(reviewed, 1);
  elements.stats.reviewBars.innerHTML = [
    { key: "know", label: "认识", className: "good" },
    { key: "fuzzy", label: "模糊", className: "mid" },
    { key: "unknown", label: "不认识", className: "bad" }
  ]
    .map(({ key, label, className }) => {
      const value = counts[key];
      const percentage = Math.round((value / totalForBars) * 100);
      return `
        <div class="bar-item">
          <div class="bar-head">
            <span>${label}</span>
            <span>${value} 词</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill ${className}" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    })
    .join("");

  elements.stats.wordStatusList.innerHTML = words
    .map((word, index) => {
      const rating = state.reviewRatingsByWord[index] || "new";
      return `
        <div class="summary-item">
          <div>
            <p><strong>${word.english}</strong> · ${word.chinese}</p>
            <small>${word.theme} · ${word.level}</small>
          </div>
          <span class="status-pill ${rating}">${ratingLabel(rating)}</span>
        </div>
      `;
    })
    .join("");
}

function attachWordJumpHandlers(container) {
  container.querySelectorAll("[data-word-index]").forEach((button) => {
    button.addEventListener("click", () => {
      state.learnIndex = Number(button.dataset.wordIndex);
      state.learnedSet.add(state.learnIndex);
      switchView("learn");
      renderLearn();
      renderStats();
    });
  });
}

function getReviewCounts() {
  return state.reviewAnswers.reduce(
    (accumulator, item) => {
      accumulator[item.rating] += 1;
      return accumulator;
    },
    { know: 0, fuzzy: 0, unknown: 0 }
  );
}

function buildReviewSuggestion(counts) {
  if (state.reviewAnswers.length === 0) {
    return "先完成一轮复习，系统会在这里给出学习建议。";
  }

  if (counts.unknown >= 3) {
    return "“不认识”的词偏多，建议先回到学习卡片，把图片和例句再过一遍。";
  }

  if (counts.fuzzy >= 3) {
    return "“模糊”的词较多，适合马上进入看图猜词模式做第二次唤醒。";
  }

  if (counts.know >= 5) {
    return "整体状态不错，可以把重心转向图片联想和例句复述。";
  }

  return "继续完成本轮复习，重点观察哪些词总是停留在“模糊”。";
}

function prepareImageQuestion() {
  if (state.imageIndex >= state.imageOrder.length) {
    return;
  }

  const correctIndex = state.imageOrder[state.imageIndex];
  const distractors = shuffle(
    words
      .map((_, index) => index)
      .filter((index) => index !== correctIndex)
  ).slice(0, 3);

  state.imageChoices = shuffle([correctIndex, ...distractors]);
}

function handleImageAnswer(selectedIndex) {
  const correctIndex = state.imageOrder[state.imageIndex];
  state.imageAnswered = true;
  state.imageAttempts += 1;
  state.imageLastCorrect = selectedIndex === correctIndex;

  if (state.imageLastCorrect) {
    state.imageScore += 1;
  }

  renderImage();
  renderStats();
}

function resetImageMode() {
  state.imageOrder = shuffle(words.map((_, index) => index));
  state.imageIndex = 0;
  state.imageAnswered = false;
  state.imageScore = 0;
  state.imageAttempts = 0;
  state.imageChoices = [];
  state.imageLastCorrect = false;
  prepareImageQuestion();
  renderImage();
  renderStats();
}

function paintImageOptions() {
  if (state.imageIndex >= state.imageOrder.length) {
    return;
  }

  const correctIndex = state.imageOrder[state.imageIndex];

  document.querySelectorAll(".option-btn").forEach((button) => {
    const optionIndex = Number(button.dataset.index);
    button.disabled = state.imageAnswered;
    button.classList.remove("correct", "incorrect");

    if (!state.imageAnswered) {
      return;
    }

    if (optionIndex === correctIndex) {
      button.classList.add("correct");
    } else if (!state.imageLastCorrect && optionIndex === Number(getSelectedOption())) {
      button.classList.add("incorrect");
    }
  });
}

function getSelectedOption() {
  const resultText = elements.imageResult.textContent;
  const currentWord = words[state.imageOrder[state.imageIndex]];
  if (resultText.includes(currentWord.english)) {
    const selected = [...document.querySelectorAll(".option-btn")].find((button) => button.classList.contains("incorrect"));
    return selected ? selected.dataset.index : currentWord.id;
  }

  return currentWord.id;
}

function ratingLabel(rating) {
  const labels = {
    know: "认识",
    fuzzy: "模糊",
    unknown: "不认识",
    new: "未复习"
  };

  return labels[rating];
}

function shuffle(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}
