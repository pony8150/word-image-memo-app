const defaultWords = [
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

const API_BASE_URL = (window.WORD_IMAGE_MEMO_API_BASE || "http://localhost:3000/api").replace(/\/$/, "");
const IMAGE_REMOVALS_STORAGE_KEY = "word-image-memo.removed-images.v1";
const API_DECK_CACHE_STORAGE_KEY = "word-image-memo.api-deck.v1";
const IMAGE_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
const LEARN_UPLOAD_DEFAULT_STATUS = "支持 jpg、png、webp、gif，单张不超过 10MB";
const LEARN_LONG_PRESS_MS = 650;

let words = cloneWords(defaultWords).map(normalizeWord);

const state = {
  dataSource: "local",
  currentView: "learn",
  learnIndex: 0,
  learnImageIndex: 0,
  learnListOpen: false,
  learnDeleteMenuOpen: false,
  learnUploadOpen: false,
  learnUploadDragging: false,
  learnUploadPending: false,
  learnUploadStatus: LEARN_UPLOAD_DEFAULT_STATUS,
  learnLongPressTriggered: false,
  learnLongPressTimer: null,
  learnedSet: new Set([0]),
  removedImagesByWord: loadRemovedImagesByWord(),
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

document.addEventListener("DOMContentLoaded", async () => {
  cacheElements();
  bindEvents();
  await refreshDeckFromServer({ silent: true });
  renderAllViews();
  switchView("learn");
});

function renderAllViews() {
  prepareImageQuestion();
  renderWelcome();
  renderLearn();
  renderReview();
  renderImage();
  renderStats();
}

async function refreshDeckFromServer({ preserveWordId = null, silent = false } = {}) {
  try {
    const remoteWords = await fetchLearningDeck();

    if (Array.isArray(remoteWords) && remoteWords.length > 0) {
      persistApiDeckCache(remoteWords);
      applyDeckWords(remoteWords, "api", preserveWordId);
      return true;
    }
  } catch (error) {
    if (!silent) {
      console.error(error);
    }
  }

  const cachedApiWords = loadCachedApiDeck();

  if (Array.isArray(cachedApiWords) && cachedApiWords.length > 0) {
    applyDeckWords(cachedApiWords, "api-cache", preserveWordId);
    return false;
  }

  applyDeckWords(defaultWords, "local", preserveWordId);
  return false;
}

function applyDeckWords(nextWords, dataSource, preserveWordId = null) {
  const normalizedWords = cloneWords(nextWords).map(normalizeWord);
  const nextIndex = normalizedWords.findIndex((word) => word.id === preserveWordId);

  clearLearnMediaLongPress();
  words = normalizedWords;
  state.dataSource = dataSource;
  state.learnIndex = nextIndex >= 0 ? nextIndex : 0;
  state.learnImageIndex = 0;
  state.learnDeleteMenuOpen = false;
  state.learnUploadOpen = false;
  state.learnUploadDragging = false;
  state.learnUploadPending = false;
  state.learnUploadStatus = LEARN_UPLOAD_DEFAULT_STATUS;
  state.learnLongPressTriggered = false;
  state.learnLongPressTimer = null;
  state.learnedSet = words.length > 0 ? new Set([state.learnIndex]) : new Set();
  state.reviewOrder = words.map((_, index) => index);
  state.reviewIndex = 0;
  state.reviewRevealed = false;
  state.reviewAnswers = [];
  state.reviewRatingsByWord = {};
  state.imageOrder = shuffle(words.map((_, index) => index));
  state.imageIndex = 0;
  state.imageAnswered = false;
  state.imageScore = 0;
  state.imageAttempts = 0;
  state.imageChoices = [];
  state.imageLastCorrect = false;
  state.imageSelectedIndex = null;
  resetLearnUploadInput();
  syncLearnUploadModal();
}

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
  elements.learnImageMenu = document.getElementById("learn-image-menu");
  elements.learnImageSearch = document.getElementById("learn-image-search");
  elements.learnImageUpload = document.getElementById("learn-image-upload");
  elements.learnImageDelete = document.getElementById("learn-image-delete");
  elements.learnUploadModal = document.getElementById("learn-upload-modal");
  elements.learnUploadDropzone = document.getElementById("learn-upload-dropzone");
  elements.learnUploadInput = document.getElementById("learn-upload-input");
  elements.learnUploadStatus = document.getElementById("learn-upload-status");
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

  elements.learnMedia.addEventListener("pointerdown", handleLearnMediaPointerDown);
  elements.learnMedia.addEventListener("pointerup", clearLearnMediaLongPress);
  elements.learnMedia.addEventListener("pointerleave", clearLearnMediaLongPress);
  elements.learnMedia.addEventListener("pointercancel", clearLearnMediaLongPress);
  elements.learnMedia.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
  elements.learnMedia.addEventListener("click", () => {
    if (state.learnLongPressTriggered) {
      state.learnLongPressTriggered = false;
      return;
    }

    if (state.learnDeleteMenuOpen) {
      return;
    }

    const images = getWordImages(words[state.learnIndex]);

    if (images.length < 2) {
      return;
    }

    state.learnImageIndex = (state.learnImageIndex + 1) % images.length;
    renderLearn();
  });

  // Prototype actions should not break core learning navigation if the menu markup is stale.
  if (elements.learnImageSearch) {
    elements.learnImageSearch.addEventListener("click", () => {
      handlePendingLearnImageAction("search");
    });
  }

  if (elements.learnImageUpload) {
    elements.learnImageUpload.addEventListener("click", () => {
      openLearnUploadModal();
    });
  }

  if (elements.learnImageDelete) {
    elements.learnImageDelete.addEventListener("click", deleteCurrentLearnImage);
  }

  if (elements.learnImageMenu) {
    elements.learnImageMenu.addEventListener("click", (event) => {
      if (event.target === elements.learnImageMenu) {
        setLearnDeleteMenu(false);
      }
    });
  }

  if (elements.learnUploadModal) {
    elements.learnUploadModal.addEventListener("click", (event) => {
      if (event.target === elements.learnUploadModal) {
        closeLearnUploadModal();
      }
    });
  }

  if (elements.learnUploadDropzone) {
    elements.learnUploadDropzone.addEventListener("click", () => {
      triggerLearnUploadPicker();
    });
    elements.learnUploadDropzone.addEventListener("dragenter", handleLearnUploadDragEnter);
    elements.learnUploadDropzone.addEventListener("dragover", handleLearnUploadDragOver);
    elements.learnUploadDropzone.addEventListener("dragleave", handleLearnUploadDragLeave);
    elements.learnUploadDropzone.addEventListener("drop", handleLearnUploadDrop);
  }

  if (elements.learnUploadInput) {
    elements.learnUploadInput.addEventListener("change", (event) => {
      handleLearnUploadFiles(event.target.files);
    });
  }

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

    setLearnDeleteMenu(false);
    state.learnIndex -= 1;
    state.learnImageIndex = 0;
    state.learnedSet.add(state.learnIndex);
    renderLearn();
    renderStats();
  });

  elements.learnNext.addEventListener("click", () => {
    setLearnDeleteMenu(false);
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
    if (event.key === "Escape") {
      if (state.learnUploadOpen) {
        closeLearnUploadModal();
      }

      if (state.learnDeleteMenuOpen) {
        setLearnDeleteMenu(false);
      }

      if (state.learnListOpen) {
        setLearnDrawer(false);
      }
    }
  });
}

function switchView(viewId) {
  const nextView = viewId === "learn" ? "learn" : "learn";
  state.currentView = nextView;

  if (nextView !== "learn" && state.learnListOpen) {
    setLearnDrawer(false);
  }

  elements.views.forEach((view) => {
    view.classList.toggle("active", view.id === nextView);
  });

  elements.navPills.forEach((button) => {
    button.classList.toggle("active", button.dataset.target === nextView);
  });

  if (nextView === "learn") {
    renderLearn();
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
  elements.learnMedia.classList.toggle("is-switchable", images.length > 1 && !state.learnDeleteMenuOpen);
  elements.learnMedia.classList.toggle("is-manage-open", state.learnDeleteMenuOpen);
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

function setLearnDeleteMenu(isOpen) {
  if (!elements.learnImageMenu || !elements.learnImageDelete) {
    return;
  }

  state.learnDeleteMenuOpen = isOpen;
  clearLearnMediaLongPress();

  const images = getWordImages(words[state.learnIndex]);
  const canDelete = images.length > 1;

  elements.learnImageMenu.hidden = !isOpen;
  elements.learnImageMenu.setAttribute("aria-hidden", String(!isOpen));
  elements.learnMedia.classList.toggle("is-manage-open", isOpen);
  elements.learnMedia.classList.toggle("is-switchable", images.length > 1 && !isOpen);
  elements.learnImageDelete.disabled = !canDelete;
  elements.learnImageDelete.textContent = "删除";
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
  setLearnDeleteMenu(false);
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
  const uniqueImages = images.filter(
    (image, index, collection) => collection.findIndex((candidate) => candidate.url === image.url) === index
  );
  const removedUrls = state.dataSource === "local" ? new Set(state.removedImagesByWord[word.id] || []) : new Set();
  const visibleImages = uniqueImages.filter((image) => !removedUrls.has(image.url));

  return visibleImages.length > 0 ? visibleImages : uniqueImages.slice(0, 1);
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

function handleLearnMediaPointerDown(event) {
  if (state.learnDeleteMenuOpen) {
    return;
  }

  if (event.pointerType === "mouse" && event.button !== 0) {
    return;
  }

  clearLearnMediaLongPress();
  state.learnLongPressTriggered = false;
  state.learnLongPressTimer = window.setTimeout(() => {
    state.learnLongPressTriggered = true;
    setLearnDeleteMenu(true);
  }, LEARN_LONG_PRESS_MS);
}

function clearLearnMediaLongPress() {
  if (!state.learnLongPressTimer) {
    return;
  }

  window.clearTimeout(state.learnLongPressTimer);
  state.learnLongPressTimer = null;
}

function handlePendingLearnImageAction(action) {
  setLearnDeleteMenu(false);
  console.info(`Learn image action is not implemented yet: ${action}`);
}

function openLearnUploadModal() {
  setLearnDeleteMenu(false);
  state.learnUploadOpen = true;
  state.learnUploadDragging = false;
  state.learnUploadStatus = LEARN_UPLOAD_DEFAULT_STATUS;
  syncLearnUploadModal();
}

function closeLearnUploadModal() {
  if (state.learnUploadPending) {
    return;
  }

  state.learnUploadOpen = false;
  state.learnUploadDragging = false;
  state.learnUploadStatus = LEARN_UPLOAD_DEFAULT_STATUS;
  resetLearnUploadInput();
  syncLearnUploadModal();
}

function syncLearnUploadModal() {
  if (!elements.learnUploadModal || !elements.learnUploadDropzone || !elements.learnUploadStatus) {
    return;
  }

  elements.learnUploadModal.hidden = !state.learnUploadOpen;
  elements.learnUploadModal.setAttribute("aria-hidden", String(!state.learnUploadOpen));
  elements.learnUploadDropzone.classList.toggle("is-dragging", state.learnUploadDragging);
  elements.learnUploadDropzone.disabled = state.learnUploadPending;
  elements.learnUploadStatus.textContent = state.learnUploadStatus;
}

function triggerLearnUploadPicker() {
  if (state.learnUploadPending || !elements.learnUploadInput) {
    return;
  }

  elements.learnUploadInput.click();
}

function handleLearnUploadDragEnter(event) {
  event.preventDefault();

  if (state.learnUploadPending) {
    return;
  }

  state.learnUploadDragging = true;
  state.learnUploadStatus = "松开即可上传";
  syncLearnUploadModal();
}

function handleLearnUploadDragOver(event) {
  event.preventDefault();

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "copy";
  }

  if (state.learnUploadPending) {
    return;
  }

  state.learnUploadDragging = true;
  state.learnUploadStatus = "松开即可上传";
  syncLearnUploadModal();
}

function handleLearnUploadDragLeave(event) {
  event.preventDefault();

  if (state.learnUploadPending) {
    return;
  }

  if (event.currentTarget !== event.target) {
    return;
  }

  state.learnUploadDragging = false;
  state.learnUploadStatus = LEARN_UPLOAD_DEFAULT_STATUS;
  syncLearnUploadModal();
}

function handleLearnUploadDrop(event) {
  event.preventDefault();

  if (state.learnUploadPending) {
    return;
  }

  state.learnUploadDragging = false;
  const files = event.dataTransfer?.files || null;
  handleLearnUploadFiles(files);
}

async function handleLearnUploadFiles(fileList) {
  const file = fileList?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    state.learnUploadStatus = "只能上传图片文件";
    resetLearnUploadInput();
    syncLearnUploadModal();
    return;
  }

  if (file.size > IMAGE_UPLOAD_MAX_BYTES) {
    state.learnUploadStatus = "图片太大了，请控制在 10MB 以内";
    resetLearnUploadInput();
    syncLearnUploadModal();
    return;
  }

  const currentWord = words[state.learnIndex];
  state.learnUploadPending = true;
  state.learnUploadDragging = false;
  state.learnUploadStatus = "上传中...";
  syncLearnUploadModal();

  try {
    const payload = await uploadWordImageApi(currentWord.id, file);
    state.dataSource = "api";
    updateWordInDeck(payload.word);
    state.learnImageIndex = Math.max(getWordImages(words[state.learnIndex]).length - 1, 0);
    resetLearnUploadInput();
    state.learnUploadPending = false;
    closeLearnUploadModal();
    renderLearn();
    renderReview();
    renderImage();
  } catch (error) {
    console.error(error);
    state.learnUploadPending = false;
    state.learnUploadStatus = getLearnUploadErrorMessage(error);
    resetLearnUploadInput();
    syncLearnUploadModal();
  }
}

function resetLearnUploadInput() {
  if (!elements.learnUploadInput) {
    return;
  }

  elements.learnUploadInput.value = "";
}

function getLearnUploadErrorMessage(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "上传失败，请确认后端已经启动";
}

async function deleteCurrentLearnImage() {
  const word = words[state.learnIndex];
  const images = getWordImages(word);

  if (images.length <= 1) {
    setLearnDeleteMenu(false);
    return;
  }

  const activeIndex = Math.min(state.learnImageIndex, images.length - 1);
  const activeImage = images[activeIndex];

  if (typeof activeImage.id === "number") {
    elements.learnImageDelete.disabled = true;
    elements.learnImageDelete.textContent = "删除中...";

    try {
      const payload = await deleteWordImageApi(activeImage.id);
      updateWordInDeck(payload.word);
      state.learnImageIndex = Math.min(activeIndex, getWordImages(words[state.learnIndex]).length - 1);
    } catch (error) {
      console.error(error);
      window.alert("删除失败，请确认后端已启动，并且数据库已初始化。");
    } finally {
      setLearnDeleteMenu(false);
      renderLearn();
      renderReview();
      renderImage();
    }

    return;
  }

  const removedUrls = state.removedImagesByWord[word.id] || [];

  if (!removedUrls.includes(activeImage.url)) {
    state.removedImagesByWord[word.id] = [...removedUrls, activeImage.url];
    persistRemovedImagesByWord();
  }

  state.learnImageIndex = Math.min(activeIndex, images.length - 2);
  setLearnDeleteMenu(false);
  renderLearn();
  renderReview();
  renderImage();
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

function loadRemovedImagesByWord() {
  try {
    const rawValue = window.localStorage.getItem(IMAGE_REMOVALS_STORAGE_KEY);

    if (!rawValue) {
      return {};
    }

    const parsedValue = JSON.parse(rawValue);
    return parsedValue && typeof parsedValue === "object" ? parsedValue : {};
  } catch (error) {
    return {};
  }
}

function persistRemovedImagesByWord() {
  try {
    window.localStorage.setItem(IMAGE_REMOVALS_STORAGE_KEY, JSON.stringify(state.removedImagesByWord));
  } catch (error) {
    return;
  }
}

function loadCachedApiDeck() {
  try {
    const rawValue = window.localStorage.getItem(API_DECK_CACHE_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : null;
  } catch (error) {
    return null;
  }
}

function persistApiDeckCache(deckWords) {
  try {
    window.localStorage.setItem(API_DECK_CACHE_STORAGE_KEY, JSON.stringify(deckWords));
  } catch (error) {
    return;
  }
}

function cloneWords(sourceWords) {
  return sourceWords.map((word) => ({
    ...word,
    images: Array.isArray(word.images) ? word.images.map((image) => ({ ...image })) : []
  }));
}

function normalizeWord(word) {
  const normalizedImages = (Array.isArray(word.images) ? word.images : []).map((image, index) => ({
    id: typeof image.id === "number" ? image.id : image.id || `${word.id}-${index + 1}`,
    url: image.url || image.publicUrl || "",
    source: image.source || image.sourceLabel || word.imageSource || "Image",
    credit: image.credit ?? image.sourceCredit ?? word.imageCredit ?? null,
    storageType: image.storageType || "external",
    storageKey: image.storageKey || null,
    sortOrder: image.sortOrder ?? index
  }));

  return {
    ...word,
    image: word.image || normalizedImages[0]?.url || "",
    imageSource: word.imageSource || normalizedImages[0]?.source || null,
    imageCredit: word.imageCredit || normalizedImages[0]?.credit || null,
    images: normalizedImages
  };
}

async function fetchLearningDeck() {
  const response = await fetch(`${API_BASE_URL}/learning-deck`, {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to load learning deck: ${response.status}`);
  }

  const payload = await response.json();
  return payload.words || [];
}

async function deleteWordImageApi(imageId) {
  const response = await fetch(`${API_BASE_URL}/word-images/${imageId}/delete`, {
    method: "PATCH",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to delete image: ${response.status}`);
  }

  return response.json();
}

async function uploadWordImageApi(wordId, file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE_URL}/word-images/upload/${encodeURIComponent(wordId)}`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, "图片上传失败"));
  }

  return response.json();
}

async function extractApiErrorMessage(response, fallbackMessage) {
  try {
    const payload = await response.json();

    if (Array.isArray(payload.message) && payload.message.length > 0) {
      return String(payload.message[0]);
    }

    if (typeof payload.message === "string" && payload.message.trim()) {
      return payload.message;
    }
  } catch (error) {
    return `${fallbackMessage} (${response.status})`;
  }

  return `${fallbackMessage} (${response.status})`;
}

function updateWordInDeck(nextWord) {
  if (!nextWord) {
    return;
  }

  const normalizedWord = normalizeWord(nextWord);
  const wordIndex = words.findIndex((word) => word.id === normalizedWord.id);

  if (wordIndex === -1) {
    return;
  }

  words[wordIndex] = normalizedWord;

  if (state.dataSource !== "local") {
    persistApiDeckCache(words);
  }
}
