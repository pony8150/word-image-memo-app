const words = [
  {
    id: "apple",
    english: "apple",
    chinese: "苹果",
    image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=1400&q=80",
    imageSource: "Unsplash",
    imageCredit: "Maksym Kaharlytskyi",
    images: [
      {
        url: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=1400&q=80",
        source: "Unsplash"
      },
      {
        url: "https://images.pexels.com/photos/3903200/pexels-photo-3903200.jpeg?auto=compress&cs=tinysrgb&w=1400&h=900&fit=crop",
        source: "Pexels"
      }
    ],
    imageReason: "红苹果主体非常明确，颜色醒目，学生一眼就能把 apple 和真实水果连起来。",
    level: "初中高频",
    theme: "食物",
    example: "I put an apple in my school bag for lunch.",
    exampleChinese: "我把一个苹果放进书包里当午餐。",
    scene: "午餐盒打开的瞬间，一颗新鲜红苹果最先跳进视线。"
  },
  {
    id: "bicycle",
    english: "bicycle",
    chinese: "自行车",
    image: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1400&q=80",
    imageSource: "Unsplash",
    imageCredit: "Murillo de Paula",
    images: [
      {
        url: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1400&q=80",
        source: "Unsplash"
      },
      {
        url: "https://images.pexels.com/photos/17574898/pexels-photo-17574898.jpeg?auto=compress&cs=tinysrgb&w=1400&h=900&fit=crop",
        source: "Pexels"
      }
    ],
    imageReason: "真实街道上的自行车比图标更有生活感，两个车轮和骑行姿态能快速触发记忆。",
    level: "初中高频",
    theme: "日常出行",
    example: "He rides his bicycle to school on sunny days.",
    exampleChinese: "天气晴朗的时候，他骑自行车去上学。",
    scene: "放学路上骑车回家，车轮转起来的画面很容易和单词绑定。"
  },
  {
    id: "library",
    english: "library",
    chinese: "图书馆",
    image: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1400&q=80",
    imageSource: "Unsplash",
    imageCredit: "Robert Bye",
    images: [
      {
        url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1400&q=80",
        source: "Unsplash"
      },
      {
        url: "https://images.pexels.com/photos/3747593/pexels-photo-3747593.jpeg?auto=compress&cs=tinysrgb&w=1400&h=900&fit=crop",
        source: "Pexels"
      }
    ],
    imageReason: "书架、桌椅和安静光线一起出现时，library 不再是抽象名词，而是一个能进入的真实空间。",
    level: "初中高频",
    theme: "校园",
    example: "We borrow story books from the library after class.",
    exampleChinese: "我们下课后从图书馆借故事书。",
    scene: "午后阳光洒进图书馆，学生坐在书架旁安静看书。"
  },
  {
    id: "bridge",
    english: "bridge",
    chinese: "桥",
    image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1400&q=80",
    imageSource: "Unsplash",
    imageCredit: "Andreas Gucklhorn",
    images: [
      {
        url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1400&q=80",
        source: "Unsplash"
      },
      {
        url: "https://images.pexels.com/photos/214053/pexels-photo-214053.jpeg?auto=compress&cs=tinysrgb&w=1400&h=900&fit=crop",
        source: "Pexels"
      }
    ],
    imageReason: "桥横跨两端的结构很直观，雾气和纵深感让画面更有记忆点。",
    level: "初中高频",
    theme: "自然与建筑",
    example: "A small bridge crosses the river behind the village.",
    exampleChinese: "村子后面有一座小桥横跨河流。",
    scene: "薄雾里，一座长桥从一端延伸到另一端，像把两侧世界连起来。"
  },
  {
    id: "forest",
    english: "forest",
    chinese: "森林",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=80",
    imageSource: "Unsplash",
    imageCredit: "Geran de Klerk",
    images: [
      {
        url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=80",
        source: "Unsplash"
      },
      {
        url: "https://images.pexels.com/photos/240040/pexels-photo-240040.jpeg?auto=compress&cs=tinysrgb&w=1400&h=900&fit=crop",
        source: "Pexels"
      }
    ],
    imageReason: "树木密集、光线穿透树林的场景，比单棵树更能体现 forest 的整体感。",
    level: "初中高频",
    theme: "自然",
    example: "The forest becomes quiet after sunset.",
    exampleChinese: "日落以后，森林变得安静下来。",
    scene: "阳光从高高的树间落下来，整片森林安静又深。"
  },
  {
    id: "courage",
    english: "courage",
    chinese: "勇气",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    imageSource: "Unsplash",
    imageCredit: "Dane Deaner",
    images: [
      {
        url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
        source: "Unsplash"
      },
      {
        url: "https://images.pexels.com/photos/461593/pexels-photo-461593.jpeg?auto=compress&cs=tinysrgb&w=1400&h=900&fit=crop",
        source: "Pexels"
      }
    ],
    imageReason: "站在高处望向远方的人物场景，比抽象符号更能传达明明紧张但还是向前的 courage。",
    level: "高中常用",
    theme: "情绪与品质",
    example: "It takes courage to speak English in front of the class.",
    exampleChinese: "在全班同学面前说英语需要勇气。",
    scene: "一个人站在高处迎着风，虽然不轻松，但没有退后。"
  },
  {
    id: "whisper",
    english: "whisper",
    chinese: "低声说",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1400&q=80",
    imageSource: "Unsplash",
    imageCredit: "Matheus Ferrero",
    images: [
      {
        url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1400&q=80",
        source: "Unsplash"
      },
      {
        url: "https://commons.wikimedia.org/wiki/Special:FilePath/Let%20me%20tell%20you%20a%20secret.jpg?width=1400",
        source: "Wikimedia Commons"
      }
    ],
    imageReason: "靠近耳边说话的真实动作是 whisper 最强的视觉线索，比任何图标都更像轻声说。",
    level: "高中常用",
    theme: "动作",
    example: "Please whisper in the reading room.",
    exampleChinese: "在阅览室里请低声说话。",
    scene: "安静环境里，两个人靠近耳边小声交流，几乎只有对方听得见。"
  },
  {
    id: "puzzle",
    english: "puzzle",
    chinese: "谜题；拼图",
    image: "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?auto=format&fit=crop&w=1400&q=80",
    imageSource: "Unsplash",
    imageCredit: "Mel Poole",
    images: [
      {
        url: "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?auto=format&fit=crop&w=1400&q=80",
        source: "Unsplash"
      },
      {
        url: "https://images.pexels.com/photos/9227508/pexels-photo-9227508.jpeg?auto=compress&cs=tinysrgb&w=1400&h=900&fit=crop",
        source: "Pexels"
      }
    ],
    imageReason: "散开的拼图块和正在完成的图案，能直接让学生联想到 puzzle 的拼起来过程。",
    level: "初中高频",
    theme: "学习活动",
    example: "This puzzle helps us remember new shapes.",
    exampleChinese: "这个拼图帮助我们记住新的图形。",
    scene: "桌面上散着拼图块，找到正确位置后，图像慢慢完整起来。"
  },
  {
    id: "journey",
    english: "journey",
    chinese: "旅程",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80",
    imageSource: "Unsplash",
    imageCredit: "Luke Stackpoole",
    images: [
      {
        url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80",
        source: "Unsplash"
      },
      {
        url: "https://images.pexels.com/photos/1029639/pexels-photo-1029639.jpeg?auto=compress&cs=tinysrgb&w=1400&h=900&fit=crop",
        source: "Pexels"
      }
    ],
    imageReason: "向远方延伸的道路特别适合表现 journey 的过程感，比交通工具特写更有出发记忆。",
    level: "高中常用",
    theme: "旅行",
    example: "Our train journey to Beijing started early in the morning.",
    exampleChinese: "我们去北京的火车旅程一大早就开始了。",
    scene: "一条路向远方伸展，清晨出发时最能感觉到旅程开始了。"
  },
  {
    id: "harvest",
    english: "harvest",
    chinese: "收获；收割",
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1400&q=80",
    imageSource: "Unsplash",
    imageCredit: "Jan Kopriva",
    images: [
      {
        url: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1400&q=80",
        source: "Unsplash"
      },
      {
        url: "https://images.pexels.com/photos/18900463/pexels-photo-18900463.jpeg?auto=compress&cs=tinysrgb&w=1400&h=900&fit=crop",
        source: "Pexels"
      }
    ],
    imageReason: "金黄色田野和收成氛围能把 harvest 的季节感、成果感一起带出来。",
    level: "高中常用",
    theme: "季节与农业",
    example: "Farmers celebrate the rice harvest in autumn.",
    exampleChinese: "农民们在秋天庆祝稻谷丰收。",
    scene: "秋天的田野一片金黄，成熟作物被收进篮子里。"
  }
];

const state = {
  currentView: "learn",
  learnIndex: 0,
  learnImageIndex: 0,
  learnListOpen: false,
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
  imageLastCorrect: false,
  imageSelectedIndex: null
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
  switchView("learn");
});

function cacheElements() {
  elements.views = [...document.querySelectorAll(".view")];
  elements.targetButtons = [...document.querySelectorAll("[data-target]")];
  elements.navPills = [...document.querySelectorAll(".nav-pill")];

  elements.heroWordCount = document.getElementById("hero-word-count");
  elements.deckPreview = document.getElementById("deck-preview");

  elements.learnProgress = document.getElementById("learn-progress");
  elements.learnListToggle = document.getElementById("learn-list-toggle");
  elements.learnDrawer = document.getElementById("learn-drawer");
  elements.learnDrawerBackdrop = document.getElementById("learn-drawer-backdrop");
  elements.learnListClose = document.getElementById("learn-list-close");
  elements.learnWordPanel = document.getElementById("learn-word-panel");
  elements.learnMedia = document.getElementById("learn-media");
  elements.learnImage = document.getElementById("learn-image");
  elements.learnWord = document.getElementById("learn-word");
  elements.learnWordAudio = document.getElementById("learn-word-audio");
  elements.learnTranslation = document.getElementById("learn-translation");
  elements.learnExample = document.getElementById("learn-example");
  elements.learnExampleTranslation = document.getElementById("learn-example-translation");
  elements.learnExampleAudio = document.getElementById("learn-example-audio");
  elements.wordList = document.getElementById("word-list");
  elements.learnPrev = document.getElementById("learn-prev");
  elements.learnNext = document.getElementById("learn-next");

  elements.reviewProgress = document.getElementById("review-progress");
  elements.reviewImage = document.getElementById("review-image");
  elements.reviewWord = document.getElementById("review-word");
  elements.reviewPromptText = document.getElementById("review-prompt-text");
  elements.reviewTranslation = document.getElementById("review-translation");
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
  elements.imageReason = document.getElementById("image-mode-reason");
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
  elements.targetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.target;
      if (target) {
        switchView(target);
      }
    });
  });

  elements.deckPreview.addEventListener("click", (event) => {
    const button = event.target.closest("[data-word-index]");
    if (!button) {
      return;
    }

    jumpToWord(Number(button.dataset.wordIndex));
  });

  elements.learnListToggle.addEventListener("click", () => {
    setLearnDrawer(!state.learnListOpen);
  });

  elements.learnDrawerBackdrop.addEventListener("click", () => {
    setLearnDrawer(false);
  });

  elements.learnListClose.addEventListener("click", () => {
    setLearnDrawer(false);
  });

  elements.learnWordAudio.addEventListener("click", () => {
    speakEnglish(words[state.learnIndex].english);
  });

  elements.learnExampleAudio.addEventListener("click", () => {
    speakEnglish(words[state.learnIndex].example);
  });

  elements.learnMedia.addEventListener("click", () => {
    const images = getWordImages(words[state.learnIndex]);

    if (images.length < 2) {
      return;
    }

    state.learnImageIndex = (state.learnImageIndex + 1) % images.length;
    renderLearn();
  });

  elements.wordList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-word-index]");
    if (!button) {
      return;
    }

    jumpToWord(Number(button.dataset.wordIndex));
  });

  elements.learnPrev.addEventListener("click", () => {
    if (state.learnIndex === 0) {
      return;
    }

    state.learnIndex -= 1;
    state.learnImageIndex = 0;
    state.learnedSet.add(state.learnIndex);
    renderLearn();
    renderStats();
  });

  elements.learnNext.addEventListener("click", () => {
    state.learnIndex = state.learnIndex < words.length - 1 ? state.learnIndex + 1 : 0;
    state.learnImageIndex = 0;
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

    handleImageAnswer(Number(button.dataset.index));
  });

  elements.imageNext.addEventListener("click", () => {
    if (state.imageIndex < state.imageOrder.length - 1) {
      state.imageIndex += 1;
      state.imageAnswered = false;
      state.imageSelectedIndex = null;
      prepareImageQuestion();
      renderImage();
      return;
    }

    state.imageIndex = state.imageOrder.length;
    state.imageAnswered = true;
    renderImage();
    renderStats();
  });

  elements.imageReset.addEventListener("click", resetImageMode);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.learnListOpen) {
      setLearnDrawer(false);
    }
  });
}

function switchView(viewId) {
  state.currentView = viewId;

  if (viewId !== "learn" && state.learnListOpen) {
    setLearnDrawer(false);
  }

  elements.views.forEach((view) => {
    view.classList.toggle("active", view.id === viewId);
  });

  elements.navPills.forEach((button) => {
    button.classList.toggle("active", button.dataset.target === viewId);
  });

  if (viewId === "learn") {
    renderLearn();
  }

  if (viewId === "review") {
    renderReview();
  }

  if (viewId === "image") {
    renderImage();
  }

  if (viewId === "stats") {
    renderStats();
  }
}

function renderWelcome() {
  elements.heroWordCount.textContent = String(words.length);
  elements.deckPreview.innerHTML = words
    .slice(0, 4)
    .map(
      (word, index) => `
        <button class="deck-card ${index === state.learnIndex ? "active" : ""}" data-word-index="${index}">
          <img src="${getWordImages(word)[0].url}" alt="${word.english}" />
          <div>
            <strong>${word.english}</strong>
            <small>${word.chinese}</small>
          </div>
        </button>
      `
    )
    .join("");
}

function renderLearn() {
  const word = words[state.learnIndex];
  const images = getWordImages(word);
  const activeImage = images[Math.min(state.learnImageIndex, images.length - 1)];

  elements.learnProgress.textContent = `学习进度 ${state.learnIndex + 1} / ${words.length}`;
  elements.learnImage.src = activeImage.url;
  elements.learnImage.alt = `${word.english} 的真实图片`;
  elements.learnMedia.classList.toggle("is-switchable", images.length > 1);
  elements.learnWord.textContent = word.english;
  elements.learnTranslation.textContent = word.chinese;
  elements.learnExample.textContent = word.example;
  elements.learnExampleTranslation.textContent = word.exampleChinese || "";

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

  syncLearnListVisibility();
  renderWelcome();
}

function syncLearnListVisibility() {
  const isOpen = state.learnListOpen;
  elements.learnDrawer.classList.toggle("is-open", isOpen);
  elements.learnDrawer.setAttribute("aria-hidden", String(!isOpen));
  elements.learnListToggle.textContent = isOpen ? "收起单词列表" : "显示单词列表";
  elements.learnListToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("drawer-open", isOpen);
}

function setLearnDrawer(isOpen) {
  state.learnListOpen = isOpen;
  syncLearnListVisibility();
}

function renderReview() {
  const counts = getReviewCounts();
  const total = state.reviewOrder.length;

  elements.reviewCounts.know.textContent = String(counts.know);
  elements.reviewCounts.fuzzy.textContent = String(counts.fuzzy);
  elements.reviewCounts.unknown.textContent = String(counts.unknown);
  elements.reviewProgress.textContent = `复习进度 ${Math.min(state.reviewIndex + 1, total)} / ${total}`;
  elements.reviewSuggestion.textContent = buildReviewSuggestion(counts);

  if (state.reviewIndex >= total) {
    const lastWord = words[state.reviewOrder[total - 1]];
    elements.reviewImage.src = getWordImages(lastWord)[0].url;
    elements.reviewImage.alt = "复习完成";
    elements.reviewWord.textContent = "这一轮复习完成";
    elements.reviewPromptText.textContent = "可以切到统计页查看薄弱词，或继续去玩一轮看图猜词。";
    elements.reviewTranslation.textContent = "今天这一组词已经复习完了。";
    elements.reviewAnswer.classList.add("revealed");
    elements.reviewReveal.disabled = true;
    elements.rateButtons.forEach((button) => {
      button.disabled = true;
    });
    return;
  }

  const wordIndex = state.reviewOrder[state.reviewIndex];
  const word = words[wordIndex];
  const reviewImage = getRoundImage(word, state.reviewIndex);

  elements.reviewImage.src = reviewImage.url;
  elements.reviewImage.alt = `${word.english} 的复习图片`;
  elements.reviewWord.textContent = word.english;
  elements.reviewPromptText.textContent = state.reviewRevealed
    ? "已经显示答案，看看自己刚才想得对不对。"
    : "先看图，试着自己想起这个词对应的中文意思。";
  elements.reviewTranslation.textContent = word.chinese;
  elements.reviewAnswer.classList.toggle("revealed", state.reviewRevealed);
  elements.reviewReveal.disabled = state.reviewRevealed;

  elements.rateButtons.forEach((button) => {
    button.disabled = !state.reviewRevealed;
  });
}

function renderImage() {
  const total = state.imageOrder.length;
  const accuracy = state.imageAttempts === 0 ? 0 : Math.round((state.imageScore / state.imageAttempts) * 100);

  if (state.imageIndex >= total) {
    elements.imageProgress.textContent = `完成 ${total} / ${total}`;
    elements.imagePromptText.textContent = "这一轮看图猜词结束了，可以重新开始再来一轮。";
    elements.imageReason.textContent = "完成后继续回看学习卡片，图片记忆会更牢。";
    elements.imageOptions.innerHTML = "";
    elements.imageResult.innerHTML = `
      <strong>最终成绩：${state.imageScore} / ${state.imageAttempts}</strong>
      <p>命中率 ${accuracy}%。建议把猜错的词再回到学习页看一遍。</p>
    `;
    elements.imageNext.disabled = true;
    return;
  }

  const wordIndex = state.imageOrder[state.imageIndex];
  const word = words[wordIndex];
  const promptImage = getRoundImage(word, state.imageIndex);

  elements.imageProgress.textContent = `看图猜词 ${state.imageIndex + 1} / ${total}`;
  elements.imageVisual.src = promptImage.url;
  elements.imageVisual.alt = `${word.english} 的猜词图片`;
  elements.imagePromptText.textContent = state.imageAnswered
    ? `答案：${word.english} · ${word.chinese}`
    : "先看图，不看中文，直接选你觉得最像的英文词。";
  elements.imageReason.textContent = state.imageAnswered
    ? word.imageReason
    : "先观察图片里的主体、动作和环境，再做选择。";

  elements.imageOptions.innerHTML = state.imageChoices
    .map((choiceIndex) => {
      const choice = words[choiceIndex];
      const classNames = ["option-btn"];

      if (state.imageAnswered && choiceIndex === wordIndex) {
        classNames.push("correct");
      }

      if (state.imageAnswered && choiceIndex === state.imageSelectedIndex && choiceIndex !== wordIndex) {
        classNames.push("incorrect");
      }

      return `
        <button class="${classNames.join(" ")}" data-index="${choiceIndex}" ${state.imageAnswered ? "disabled" : ""}>
          <strong>${choice.english}</strong>
          <small>${choice.theme}</small>
        </button>
      `;
    })
    .join("");

  elements.imageResult.innerHTML = state.imageAnswered
    ? `
        <strong>${state.imageLastCorrect ? "答对了" : "这次没猜中"}</strong>
        <p>${state.imageLastCorrect ? "继续下一题。" : "回到学习页再看一遍图片和例句。"}</p>
      `
    : `
        <strong>当前正确 ${state.imageScore} / ${state.imageAttempts}</strong>
        <p>先靠画面判断，不要先想中文。</p>
      `;

  elements.imageNext.disabled = !state.imageAnswered;
}

function renderStats() {
  const counts = getReviewCounts();
  const reviewed = state.reviewAnswers.length;
  const accuracy = state.imageAttempts === 0 ? 0 : Math.round((state.imageScore / state.imageAttempts) * 100);
  const barTotal = Math.max(reviewed, 1);

  elements.stats.total.textContent = String(words.length);
  elements.stats.learned.textContent = String(state.learnedSet.size);
  elements.stats.reviewed.textContent = String(reviewed);
  elements.stats.imageAccuracy.textContent = `${accuracy}%`;

  elements.stats.reviewBars.innerHTML = [
    { key: "know", label: "认识", className: "good" },
    { key: "fuzzy", label: "模糊", className: "mid" },
    { key: "unknown", label: "不认识", className: "bad" }
  ]
    .map(({ key, label, className }) => {
      const value = counts[key];
      const percentage = Math.round((value / barTotal) * 100);
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
    .map((word, index) => `
      <div class="summary-item">
        <div>
          <p><strong>${word.english}</strong> · ${word.chinese}</p>
        </div>
        <span class="status-pill ${state.reviewRatingsByWord[index] || "new"}">${ratingLabel(state.reviewRatingsByWord[index] || "new")}</span>
      </div>
    `)
    .join("");
}

function jumpToWord(index) {
  state.learnIndex = index;
  state.learnImageIndex = 0;
  state.learnedSet.add(index);
  setLearnDrawer(false);
  switchView("learn");
  renderLearn();
  renderStats();
}

function buildReviewSuggestion(counts) {
  if (state.reviewAnswers.length === 0) {
    return "先完成一轮复习，系统会根据你的打分给出建议。";
  }

  if (counts.unknown >= 3) {
    return "不认识的词偏多，建议先回到学习卡片再看一遍图片和例句。";
  }

  if (counts.fuzzy >= 3) {
    return "模糊的词比较多，适合立刻去做一轮看图猜词加深联想。";
  }

  if (counts.know >= 5) {
    return "整体状态不错，可以继续靠图片回忆，把速度再提起来。";
  }

  return "继续完成这一轮复习，重点观察哪些词总会停在模糊。";
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

function getWordImages(word) {
  const fallback = word.image
    ? [
        {
          url: word.image,
          source: word.imageSource || "Unknown"
        }
      ]
    : [];

  const images = Array.isArray(word.images) && word.images.length > 0 ? word.images : fallback;

  return images.filter(
    (image, index, collection) => collection.findIndex((candidate) => candidate.source === image.source) === index
  );
}

function getRoundImage(word, roundIndex) {
  const images = getWordImages(word);
  return images[roundIndex % images.length];
}

function prepareImageQuestion() {
  if (state.imageIndex >= state.imageOrder.length) {
    return;
  }

  const correctIndex = state.imageOrder[state.imageIndex];
  const distractors = shuffle(words.map((_, index) => index).filter((index) => index !== correctIndex)).slice(0, 3);

  state.imageChoices = shuffle([correctIndex, ...distractors]);
}

function handleImageAnswer(selectedIndex) {
  const correctIndex = state.imageOrder[state.imageIndex];
  state.imageAnswered = true;
  state.imageAttempts += 1;
  state.imageSelectedIndex = selectedIndex;
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
  state.imageSelectedIndex = null;
  elements.imageNext.disabled = false;
  prepareImageQuestion();
  renderImage();
  renderStats();
}

function speakEnglish(text) {
  if (!text || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.92;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
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
