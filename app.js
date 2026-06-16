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

// Read legacy keys during the rename so existing sessions and local cache still work.
const STORAGE_KEY_NAMESPACE = "tuge-danci";
const LEGACY_STORAGE_KEY_NAMESPACE = "word-image-memo";
const STORAGE_KEYS = {
  imageRemovals: `${STORAGE_KEY_NAMESPACE}.removed-images.v1`,
  apiDeckCache: `${STORAGE_KEY_NAMESPACE}.api-deck.v1`,
  authSessionToken: `${STORAGE_KEY_NAMESPACE}.auth-token.v1`,
  authUser: `${STORAGE_KEY_NAMESPACE}.auth-user.v1`
};
const LEGACY_STORAGE_KEYS = {
  imageRemovals: `${LEGACY_STORAGE_KEY_NAMESPACE}.removed-images.v1`,
  apiDeckCache: `${LEGACY_STORAGE_KEY_NAMESPACE}.api-deck.v1`,
  authSessionToken: `${LEGACY_STORAGE_KEY_NAMESPACE}.auth-token.v1`,
  authUser: `${LEGACY_STORAGE_KEY_NAMESPACE}.auth-user.v1`
};
const LOCALHOST_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);
const API_BASE_URL = resolveApiBaseUrl();
const API_ORIGIN = resolveApiOrigin(API_BASE_URL);
const IMAGE_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
const LEARN_UPLOAD_DEFAULT_STATUS = "支持 jpg、png、webp、gif，单张不超过 10MB";
const LEARN_SEARCH_EMPTY_STATUS = "请输入要搜索的英文单词";
const COMMUNITY_PUBLISH_DEFAULT_STATUS = "写一句短评、联想或记忆提示后再发布。";
const LEARN_LONG_PRESS_MS = 650;
const SIDEBAR_COLLAPSE_MEDIA_QUERY = "(max-width: 1024px)";

let words = cloneWords(defaultWords).map(normalizeWord);

const state = {
  dataSource: "local",
  books: [],
  activeBookCode: "",
  currentView: "learn",
  communityFeed: [],
  communityFeedMode: "hall",
  communityFeedLoaded: false,
  communityFeedPending: false,
  communityPostId: null,
  communityPostDetail: null,
  communityPostPending: false,
  communityCommentPending: false,
  communityPublishPending: false,
  communityPublishOpen: false,
  communityPublishWordId: "",
  communityPublishImageId: null,
  communityPublishWordLabel: "",
  communityPublishDraft: "",
  communityPublishStatus: COMMUNITY_PUBLISH_DEFAULT_STATUS,
  communityPublishStatusTone: "info",
  learnIndex: 0,
  learnImageIndex: 0,
  learnListOpen: false,
  learnListQuery: "",
  learnDeleteMenuOpen: false,
  learnSearchOpen: false,
  learnSearchPending: false,
  learnSearchImportingId: null,
  learnSearchQuery: "",
  learnSearchStatus: "",
  learnSearchResults: [],
  learnSearchRequestId: 0,
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
  imageSelectedIndex: null,
  sidebarCollapsed: false,
  sidebarDrawerOpen: false,
  accountMenuOpen: false,
  authToken: loadAuthToken(),
  authUser: loadStoredAuthUser(),
  authPending: false,
  authChannel: "username",
  authMode: "login",
  authStatus: "",
  authStatusTone: "info",
  authWechatStatus: null,
  authWechatLoading: false,
  authCodePending: false,
  authCodeCooldownUntil: 0,
  authDevHint: ""
};

const elements = {};

document.addEventListener("DOMContentLoaded", async () => {
  cacheElements();
  hydrateAudioButtons();
  bindEvents();
  state.sidebarCollapsed = false;
  state.sidebarDrawerOpen = false;
  const hasSession = await initializeAuthState();
  await refreshDeckFromServer({ silent: true });
  if (hasSession) {
    await ensureCommunityFeedLoaded(true);
  }

  renderAllViews();
  switchView(hasSession ? "learn" : "auth");
  syncSidebarVisibility();
});

function renderAllViews() {
  renderDockbar();
  prepareImageQuestion();
  renderWelcome();
  renderLearn();
  syncCommunityPublishModal();
  renderCommunityFeed();
  renderCommunityPostDetail();
  renderReview();
  renderImage();
  renderStats();
  renderAuth();
}

async function refreshDeckFromServer({ preserveWordId = null, silent = false } = {}) {
  if (!state.authUser || !state.authToken) {
    state.books = [];
    state.activeBookCode = "";
    applyDeckWords([], "locked", preserveWordId);
    return false;
  }

  try {
    const payload = await fetchLearningDeck(state.activeBookCode);

    if (payload && Array.isArray(payload.words)) {
      state.books = Array.isArray(payload.books) ? payload.books : [];
      state.activeBookCode =
        payload.activeBookCode || state.activeBookCode || state.books[0]?.code || "";
      persistApiDeckCache({
        ownerKey: buildAuthCacheOwnerKey(state.authUser),
        books: state.books,
        activeBookCode: state.activeBookCode,
        words: payload.words
      });
      applyDeckWords(payload.words, "api", preserveWordId);
      return true;
    }
  } catch (error) {
    if (handlePossibleAuthError(error)) {
      state.books = [];
      state.activeBookCode = "";
      applyDeckWords([], "locked", preserveWordId);
      return false;
    }

    if (!silent) {
      console.error(error);
    }
  }

  const cachedDeck = loadCachedApiDeck();

  if (
    cachedDeck &&
    Array.isArray(cachedDeck.words) &&
    cachedDeck.ownerKey &&
    cachedDeck.ownerKey === buildAuthCacheOwnerKey(state.authUser)
  ) {
    state.books = Array.isArray(cachedDeck.books) ? cachedDeck.books : [];
    state.activeBookCode =
      cachedDeck.activeBookCode || state.activeBookCode || state.books[0]?.code || "";
    applyDeckWords(cachedDeck.words, "api-cache", preserveWordId);
    return false;
  }

  state.books = [];
  state.activeBookCode = "";
  applyDeckWords([], "empty", preserveWordId);
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
  state.learnSearchOpen = false;
  state.learnSearchPending = false;
  state.learnSearchImportingId = null;
  state.learnSearchQuery = "";
  state.learnSearchStatus = "";
  state.learnSearchResults = [];
  state.learnSearchRequestId = 0;
  state.learnUploadOpen = false;
  state.learnUploadDragging = false;
  state.learnUploadPending = false;
  state.learnUploadStatus = LEARN_UPLOAD_DEFAULT_STATUS;
  state.communityPublishOpen = false;
  state.communityPublishPending = false;
  state.communityPublishWordId = "";
  state.communityPublishImageId = null;
  state.communityPublishWordLabel = "";
  state.communityPublishDraft = "";
  state.communityPublishStatus = COMMUNITY_PUBLISH_DEFAULT_STATUS;
  state.communityPublishStatusTone = "info";
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
  syncLearnSearchModal();
  syncLearnUploadModal();
}

function cacheElements() {
  elements.appShell = document.querySelector(".app-shell");
  elements.sidebar = document.getElementById("app-sidebar");
  elements.sidebarOpenButton = document.getElementById("sidebar-open-button");
  elements.sidebarCloseButton = document.getElementById("sidebar-close-button");
  elements.sidebarBackdrop = document.getElementById("sidebar-backdrop");
  elements.sidebarDockToggle = document.getElementById("sidebar-dock-toggle");
  elements.dockbarTitle = document.getElementById("dockbar-title");
  elements.dockbarSubtitle = document.getElementById("dockbar-subtitle");
  elements.views = [...document.querySelectorAll(".view")];
  elements.targetButtons = [...document.querySelectorAll("[data-target]")];
  elements.navPills = [...document.querySelectorAll(".nav-pill")];
  elements.accountMenuWraps = [...document.querySelectorAll("[data-account-wrap]")];
  elements.accountTriggers = [...document.querySelectorAll("[data-account-trigger]")];
  elements.accountAvatars = [...document.querySelectorAll("[data-account-avatar]")];
  elements.accountMenus = [...document.querySelectorAll("[data-account-menu]")];
  elements.accountMenuNames = [...document.querySelectorAll("[data-account-menu-name]")];
  elements.accountMenuEmails = [...document.querySelectorAll("[data-account-menu-email]")];
  elements.authUserNames = [...document.querySelectorAll("[data-auth-user-name]")];
  elements.authUserMetas = [...document.querySelectorAll("[data-auth-user-meta]")];
  elements.authOpenButtons = [...document.querySelectorAll("[data-auth-open-button]")];
  elements.authLogoutButtons = [...document.querySelectorAll("[data-auth-logout-button]")];
  elements.accountMenuWrap = document.getElementById("account-menu-wrap");
  elements.accountTrigger = document.getElementById("account-trigger");
  elements.accountAvatar = document.getElementById("account-avatar");
  elements.accountMenu = document.getElementById("account-menu");
  elements.accountMenuName = document.getElementById("account-menu-name");
  elements.accountMenuEmail = document.getElementById("account-menu-email");
  elements.authUserName = document.getElementById("auth-user-name");
  elements.authUserMeta = document.getElementById("auth-user-meta");
  elements.authOpenButton = document.getElementById("auth-open-button");
  elements.authLogoutButton = document.getElementById("auth-logout-button");
  elements.authView = document.getElementById("auth");
  elements.welcomeAuthButton = document.getElementById("welcome-auth-button");
  elements.authChannelEmail = document.getElementById("auth-page-channel-email");
  elements.authChannelUsername = document.getElementById("auth-page-channel-username");
  elements.authModeLogin = document.getElementById("auth-page-mode-login");
  elements.authModeRegister = document.getElementById("auth-page-mode-register");
  elements.authForm = document.getElementById("auth-page-form");
  elements.authFormHeading = document.getElementById("auth-page-form-heading");
  elements.authFormCopy = document.getElementById("auth-page-form-copy");
  elements.authEmailField = document.getElementById("auth-page-email-field");
  elements.authCodeField = document.getElementById("auth-page-code-field");
  elements.authVerificationCode = document.getElementById("auth-page-verification-code");
  elements.authSendCode = document.getElementById("auth-page-send-code");
  elements.authEmail = document.getElementById("auth-page-email");
  elements.authUsernameField = document.getElementById("auth-page-username-field");
  elements.authUsername = document.getElementById("auth-page-username");
  elements.authPassword = document.getElementById("auth-page-password");
  elements.authConfirmPasswordField = document.getElementById("auth-page-confirm-password-field");
  elements.authConfirmPassword = document.getElementById("auth-page-confirm-password");
  elements.authSubmit = document.getElementById("auth-page-submit");
  elements.authStatus = document.getElementById("auth-page-status");
  elements.authDevHint = document.getElementById("auth-page-dev-hint");

  elements.heroWordCount = document.getElementById("hero-word-count");
  elements.deckPreview = document.getElementById("deck-preview");

  elements.bookSelect = document.getElementById("book-select");
  elements.learnProgress = document.getElementById("learn-progress");
  elements.learnListToggle = document.getElementById("learn-list-toggle");
  elements.learnListToggleLabel = document.getElementById("learn-list-toggle-label");
  elements.learnDrawer = document.getElementById("learn-drawer");
  elements.learnDrawerBackdrop = document.getElementById("learn-drawer-backdrop");
  elements.learnListClose = document.getElementById("learn-list-close");
  elements.learnListSearch = document.getElementById("learn-list-search");
  elements.learnWordPanel = document.getElementById("learn-word-panel");
  elements.learnMedia = document.getElementById("learn-media");
  elements.learnImage = document.getElementById("learn-image");
  elements.learnImageMenu = document.getElementById("learn-image-menu");
  elements.learnImagePublish = document.getElementById("learn-image-publish");
  elements.learnImageSearch = document.getElementById("learn-image-search");
  elements.learnImageUpload = document.getElementById("learn-image-upload");
  elements.learnImageDelete = document.getElementById("learn-image-delete");
  elements.learnSearchModal = document.getElementById("learn-search-modal");
  elements.learnSearchForm = document.getElementById("learn-search-form");
  elements.learnSearchInput = document.getElementById("learn-search-input");
  elements.learnSearchSubmit = document.getElementById("learn-search-submit");
  elements.learnSearchStatus = document.getElementById("learn-search-status");
  elements.learnSearchResults = document.getElementById("learn-search-results");
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
  elements.communityPublishModal = document.getElementById("community-publish-modal");
  elements.communityPublishCancel = document.getElementById("community-publish-cancel");
  elements.communityPublishCopy = document.getElementById("community-publish-copy");
  elements.communityPublishInput = document.getElementById("community-publish-input");
  elements.communityPublishStatus = document.getElementById("community-publish-status");
  elements.communityPublishSubmit = document.getElementById("community-publish-submit");

  elements.communityFeedNote = document.getElementById("community-feed-note");
  elements.communityFeedModes = [...document.querySelectorAll("[data-community-feed-mode]")];
  elements.communityFeed = document.getElementById("community-feed");
  elements.communityBackButton = document.getElementById("community-back-button");
  elements.communityPostImage = document.getElementById("community-post-image");
  elements.communityPostAvatar = document.getElementById("community-post-avatar");
  elements.communityPostAuthorName = document.getElementById("community-post-author-name");
  elements.communityPostCreatedAt = document.getElementById("community-post-created-at");
  elements.communityPostTitle = document.getElementById("community-post-title");
  elements.communityPostSubtitle = document.getElementById("community-post-subtitle");
  elements.communityPostDescription = document.getElementById("community-post-description");
  elements.communityPostWordPanel = document.getElementById("community-post-word-panel");
  elements.communityPostWordMeta = document.getElementById("community-post-word-meta");
  elements.communityPostLike = document.getElementById("community-post-like");
  elements.communityPostFavorite = document.getElementById("community-post-favorite");
  elements.communityPostFavoriteLabel = document.getElementById("community-post-favorite-label");
  elements.communityPostCommentTrigger = document.getElementById("community-post-comment-trigger");
  elements.communityPostLikeCount = document.getElementById("community-post-like-count");
  elements.communityPostFavoriteCount = document.getElementById("community-post-favorite-count");
  elements.communityPostCommentCount = document.getElementById("community-post-comment-count");
  elements.communityCommentForm = document.getElementById("community-comment-form");
  elements.communityCommentInput = document.getElementById("community-comment-input");
  elements.communityCommentSubmit = document.getElementById("community-comment-submit");
  elements.communityCommentList = document.getElementById("community-comment-list");

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

function hydrateAudioButtons() {
  const speakerMarkup = '<img class="speak-icon" src="assets/speaker.svg" alt="" />';

  if (elements.learnWordAudio) {
    elements.learnWordAudio.innerHTML = speakerMarkup;
  }

  if (elements.learnExampleAudio) {
    elements.learnExampleAudio.innerHTML = speakerMarkup;
  }
}

function hasExampleText(word) {
  return Boolean(word?.example && String(word.example).trim());
}

function getExampleFallbackCopy() {
  return {
    example: "该单词暂未补充例句。",
    exampleChinese: "后续补齐词库后，这里会显示对应的英文例句和中文翻译。"
  };
}

function bindEvents() {
  elements.authOpenButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setAccountMenuOpen(false);
      setAuthMode("login");
      switchView("auth");
    });
  });

  elements.authLogoutButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setAccountMenuOpen(false);
      handleLogout();
    });
  });

  if (elements.authModeLogin) {
    elements.authModeLogin.addEventListener("click", () => {
      setAuthMode("login");
    });
  }

  if (elements.authChannelEmail) {
    elements.authChannelEmail.addEventListener("click", () => {
      setAuthChannel("email");
    });
  }

  if (elements.authChannelUsername) {
    elements.authChannelUsername.addEventListener("click", () => {
      setAuthChannel("username");
    });
  }

  if (elements.authModeRegister) {
    elements.authModeRegister.addEventListener("click", () => {
      setAuthMode("register");
    });
  }

  if (elements.authForm) {
    elements.authForm.addEventListener("submit", handleAuthSubmit);
  }

  if (elements.authSendCode) {
    elements.authSendCode.addEventListener("click", handleSendRegisterCode);
  }

  if (elements.bookSelect) {
    elements.bookSelect.addEventListener("change", handleBookChange);
  }

  if (elements.sidebarOpenButton) {
    elements.sidebarOpenButton.addEventListener("click", () => {
      toggleSidebarFromDock();
    });
  }

  if (elements.sidebarCloseButton) {
    elements.sidebarCloseButton.addEventListener("click", () => {
      setSidebarDrawerOpen(false);
    });
  }

  if (elements.sidebarBackdrop) {
    elements.sidebarBackdrop.addEventListener("click", () => {
      setSidebarDrawerOpen(false);
    });
  }

  if (elements.sidebarDockToggle) {
    elements.sidebarDockToggle.addEventListener("click", () => {
      setSidebarCollapsed(!state.sidebarCollapsed);
    });
  }

  elements.accountTriggers.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();

      if (isCompactSidebarLayout() && state.sidebarDrawerOpen) {
        state.sidebarDrawerOpen = false;
        syncSidebarVisibility();
      }

      setAccountMenuOpen(!state.accountMenuOpen);
    });
  });

  window.addEventListener("resize", handleSidebarViewportChange);

  document.addEventListener("click", (event) => {
    if (!state.accountMenuOpen || elements.accountMenuWraps.length === 0) {
      return;
    }

    if (!elements.accountMenuWraps.some((wrap) => wrap.contains(event.target))) {
      setAccountMenuOpen(false);
    }
  });

  elements.targetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.target;
      if (target) {
        switchView(target);
        if (isCompactSidebarLayout()) {
          setSidebarDrawerOpen(false);
        }
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

  if (elements.learnListSearch) {
    elements.learnListSearch.addEventListener("input", (event) => {
      state.learnListQuery = event.target.value;
      renderWordList();
    });
  }




  elements.learnWordAudio.addEventListener("click", () => {
    if (!hasDeckWords()) {
      return;
    }

    speakEnglish(words[state.learnIndex].english);
  });

  elements.learnExampleAudio.addEventListener("click", () => {
    if (!hasDeckWords()) {
      return;
    }

    const currentWord = words[state.learnIndex];

    if (!hasExampleText(currentWord)) {
      return;
    }

    speakEnglish(currentWord.example);
  });

  elements.learnMedia.addEventListener("pointerdown", handleLearnMediaPointerDown);
  elements.learnMedia.addEventListener("pointerup", clearLearnMediaLongPress);
  elements.learnMedia.addEventListener("pointerleave", clearLearnMediaLongPress);
  elements.learnMedia.addEventListener("pointercancel", clearLearnMediaLongPress);
  elements.learnMedia.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
  [elements.learnImage, elements.reviewImage, elements.imageVisual, elements.communityPostImage]
    .filter(Boolean)
    .forEach((imageElement) => {
      imageElement.addEventListener("error", handleImageFallback);
    });
  elements.learnMedia.addEventListener("click", () => {
    if (state.learnLongPressTriggered) {
      state.learnLongPressTriggered = false;
      return;
    }

    if (!hasDeckWords()) {
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

  if (elements.learnImageSearch) {
    elements.learnImageSearch.addEventListener("click", () => {
      openLearnSearchModal();
    });
  }

  if (elements.learnImagePublish) {
    elements.learnImagePublish.addEventListener("click", () => {
      openCommunityPublishModal();
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
      event.stopPropagation();

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

  if (elements.communityPublishModal) {
    elements.communityPublishModal.addEventListener("click", (event) => {
      if (event.target === elements.communityPublishModal) {
        closeCommunityPublishModal();
      }
    });
  }

  if (elements.communityPublishCancel) {
    elements.communityPublishCancel.addEventListener("click", () => {
      closeCommunityPublishModal();
    });
  }

  if (elements.communityPublishSubmit) {
    elements.communityPublishSubmit.addEventListener("click", () => {
      submitCommunityPublish();
    });
  }

  if (elements.communityPublishInput) {
    elements.communityPublishInput.addEventListener("input", (event) => {
      state.communityPublishDraft = String(event.target.value || "");
      state.communityPublishStatus = COMMUNITY_PUBLISH_DEFAULT_STATUS;
      state.communityPublishStatusTone = "info";
      if (elements.communityPublishStatus) {
        elements.communityPublishStatus.textContent = COMMUNITY_PUBLISH_DEFAULT_STATUS;
        elements.communityPublishStatus.classList.remove("error", "success");
      }
    });
  }

  if (elements.learnSearchModal) {
    elements.learnSearchModal.addEventListener("click", (event) => {
      if (event.target === elements.learnSearchModal) {
        closeLearnSearchModal();
      }
    });
  }

  if (elements.learnSearchForm) {
    elements.learnSearchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      searchLearnImages(state.learnSearchQuery);
    });
  }

  if (elements.learnSearchInput) {
    elements.learnSearchInput.addEventListener("input", (event) => {
      state.learnSearchQuery = event.target.value;
    });
  }

  if (elements.learnSearchResults) {
    elements.learnSearchResults.addEventListener("click", (event) => {
      const button = event.target.closest("[data-search-result-id]");

      if (!button || state.learnSearchPending || state.learnSearchImportingId) {
        return;
      }

      importSelectedSearchImage(button.dataset.searchResultId);
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

  if (elements.communityFeed) {
    elements.communityFeed.addEventListener("click", (event) => {
      const card = event.target.closest("[data-community-post-id]");

      if (!card) {
        return;
      }

      openCommunityPostDetail(Number(card.dataset.communityPostId));
    });
  }

  elements.communityFeedModes.forEach((button) => {
    button.addEventListener("click", () => {
      setCommunityFeedMode(button.dataset.communityFeedMode);
    });
  });

  if (elements.communityBackButton) {
    elements.communityBackButton.addEventListener("click", () => {
      switchView("community");
    });
  }

  if (elements.communityPostLike) {
    elements.communityPostLike.addEventListener("click", () => {
      toggleCommunityPostLike();
    });
  }

  if (elements.communityPostFavorite) {
    elements.communityPostFavorite.addEventListener("click", () => {
      favoriteCommunityPost();
    });
  }

  if (elements.communityPostCommentTrigger) {
    elements.communityPostCommentTrigger.addEventListener("click", () => {
      if (elements.communityCommentInput) {
        elements.communityCommentInput.focus({ preventScroll: false });
      }
    });
  }

  if (elements.communityCommentForm) {
    elements.communityCommentForm.addEventListener("submit", (event) => {
      event.preventDefault();
      submitCommunityComment();
    });
  }

  if (elements.communityCommentList) {
    elements.communityCommentList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-community-comment-id]");

      if (!button) {
        return;
      }

      toggleCommunityCommentLike(Number(button.dataset.communityCommentId));
    });
  }

  elements.learnPrev.addEventListener("click", () => {
    if (!hasDeckWords()) {
      return;
    }

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
    if (!hasDeckWords()) {
      return;
    }

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
      if (state.accountMenuOpen) {
        setAccountMenuOpen(false);
        return;
      }

      if (state.communityPublishOpen) {
        closeCommunityPublishModal();
        return;
      }

      if (state.learnSearchOpen) {
        closeLearnSearchModal();
        return;
      }

      if (state.learnUploadOpen) {
        closeLearnUploadModal();
        return;
      }

      if (state.learnDeleteMenuOpen) {
        setLearnDeleteMenu(false);
        return;
      }

      if (state.learnListOpen) {
        setLearnDrawer(false);
        return;
      }

      if (isCompactSidebarLayout()) {
        if (state.sidebarDrawerOpen) {
          setSidebarDrawerOpen(false);
        }
        return;
      }

      if (!state.sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    }
  });
}

function renderDockbar() {
  const isAuthView = state.currentView === "auth" || !state.authUser;
  const dockbarTitles = {
    learn: "学习卡片",
    community: "社区",
    "community-post": "帖子详情",
    review: "复习模式",
    image: "看图猜词",
    stats: "学习统计",
    welcome: "欢迎页",
    auth: "登录 / 注册"
  };

  if (elements.dockbarTitle) {
    elements.dockbarTitle.textContent = isAuthView ? "登录 / 注册" : dockbarTitles[state.currentView] || "学习卡片";
  }

  if (elements.dockbarSubtitle) {
    elements.dockbarSubtitle.textContent = isAuthView
      ? "管理你的账号、词书和图片"
      : "Words and images";
  }

  syncAccountMenu();
}

function setAccountMenuOpen(isOpen) {
  state.accountMenuOpen = Boolean(isOpen);
  syncAccountMenu();
}

function syncAccountMenu() {
  elements.accountTriggers.forEach((trigger) => {
    trigger.setAttribute("aria-expanded", String(state.accountMenuOpen));
    trigger.classList.toggle("is-open", state.accountMenuOpen);
  });

  elements.accountMenus.forEach((menu) => {
    menu.hidden = !state.accountMenuOpen;
  });
}

function isCompactSidebarLayout() {
  return window.matchMedia(SIDEBAR_COLLAPSE_MEDIA_QUERY).matches;
}

function handleSidebarViewportChange() {
  if (!isCompactSidebarLayout()) {
    state.sidebarDrawerOpen = false;
  }

  syncSidebarVisibility();
}

function toggleSidebarFromDock() {
  setAccountMenuOpen(false);

  if (isCompactSidebarLayout()) {
    setSidebarDrawerOpen(!state.sidebarDrawerOpen);
    return;
  }

  setSidebarCollapsed(!state.sidebarCollapsed);
}

function syncSidebarVisibility() {
  const isCompact = isCompactSidebarLayout();
  const isDrawerOpen = isCompact && state.sidebarDrawerOpen;
  const isDesktopCollapsed = !isCompact && state.sidebarCollapsed;

  if (elements.appShell) {
    elements.appShell.classList.toggle("sidebar-open", isDrawerOpen);
    elements.appShell.classList.toggle("sidebar-collapsed", isDesktopCollapsed);
  }

  if (elements.sidebarOpenButton) {
    const isExpanded = isCompact ? state.sidebarDrawerOpen : !state.sidebarCollapsed;
    elements.sidebarOpenButton.hidden = !isCompact;
    elements.sidebarOpenButton.setAttribute("aria-expanded", String(isExpanded));
    elements.sidebarOpenButton.setAttribute("aria-label", isExpanded ? "收起目录" : "展开目录");
    elements.sidebarOpenButton.classList.toggle("is-active", isExpanded);
  }

  if (elements.sidebarCloseButton) {
    elements.sidebarCloseButton.hidden = !isCompact || !state.sidebarDrawerOpen;
    elements.sidebarCloseButton.setAttribute("aria-expanded", String(state.sidebarDrawerOpen));
  }

  if (elements.sidebarBackdrop) {
    elements.sidebarBackdrop.hidden = !isDrawerOpen;
    elements.sidebarBackdrop.setAttribute("aria-hidden", String(!isDrawerOpen));
  }

  if (elements.sidebarDockToggle) {
    elements.sidebarDockToggle.hidden = isCompact;
    elements.sidebarDockToggle.classList.toggle("is-collapsed", isDesktopCollapsed);
    elements.sidebarDockToggle.setAttribute("aria-label", isDesktopCollapsed ? "展开目录" : "收起目录");
  }

  document.body.classList.toggle("sidebar-open", isDrawerOpen);
}

function setSidebarCollapsed(isCollapsed) {
  state.sidebarCollapsed = Boolean(isCollapsed);
  syncSidebarVisibility();
}

function setSidebarDrawerOpen(isOpen) {
  state.sidebarDrawerOpen = Boolean(isOpen);
  syncSidebarVisibility();
}

async function initializeAuthState() {
  if (!state.authToken) {
    clearStoredAuthSession();
    state.authUser = null;
    state.authDevHint = "";
    return false;
  }

  try {
    const payload = await fetchCurrentUserApi();
    persistAuthSession(state.authToken, payload.user);
    state.authUser = payload.user;
    state.authDevHint = "";
    state.authStatus = "";
    state.authStatusTone = "info";
    return true;
  } catch (error) {
    clearAuthSessionState();
    state.authStatus = "登录状态已失效，请重新登录。";
    state.authStatusTone = "error";
    return false;
  }
}

function setAuthModal(isOpen) {
  switchView(isOpen || !state.authUser ? "auth" : "learn");
}

function setAuthMode(mode) {
  state.authMode = mode;
  state.authStatus = "";
  state.authStatusTone = "info";
  state.authDevHint = "";

  if (mode !== "register" || state.authChannel !== "email") {
    state.authCodeCooldownUntil = 0;
  }

  if (elements.authPassword) {
    elements.authPassword.autocomplete = mode === "register" ? "new-password" : "current-password";
  }

  if (elements.authConfirmPassword) {
    elements.authConfirmPassword.autocomplete = mode === "register" ? "new-password" : "off";
  }

  if (mode !== "register") {
    if (elements.authVerificationCode) {
      elements.authVerificationCode.value = "";
    }

    if (elements.authConfirmPassword) {
      elements.authConfirmPassword.value = "";
    }
  }

  renderAuth();
}

function setAuthChannel(channel) {
  state.authChannel = channel === "username" ? "username" : "email";
  state.authStatus = "";
  state.authStatusTone = "info";
  state.authDevHint = "";
  state.authCodeCooldownUntil = 0;

  if (state.authChannel !== "email" && elements.authVerificationCode) {
    elements.authVerificationCode.value = "";
  }

  renderAuth();
}

function renderAuth() {
  const isSignedIn = Boolean(state.authUser);
  const isUsernameChannel = state.authChannel === "username";
  const isRegisterMode = state.authMode === "register";
  const shouldShowCode = isRegisterMode && !isUsernameChannel;
  const cooldownSeconds = getAuthCodeCooldownSeconds();
  const accountDisplayName = isSignedIn ? getAuthUserDisplayName(state.authUser) : "未登录";
  const accountTriggerMeta = isSignedIn ? "已登录" : "点击登录 / 注册";
  const accountMenuMeta = isSignedIn
    ? getAuthUserAccountMeta(state.authUser)
    : "登录后再管理你的词书与图片";

  elements.authUserNames.forEach((element) => {
    element.textContent = accountDisplayName;
  });

  elements.authUserMetas.forEach((element) => {
    element.textContent = accountTriggerMeta;
  });

  elements.accountMenuNames.forEach((element) => {
    element.textContent = accountDisplayName;
  });

  elements.accountMenuEmails.forEach((element) => {
    element.textContent = accountMenuMeta;
  });

  elements.accountAvatars.forEach((element) => {
    element.textContent = getAccountAvatarText(isSignedIn ? accountDisplayName : "W");
  });

  elements.authOpenButtons.forEach((button) => {
    button.textContent = "\u767b\u5f55 / \u6ce8\u518c";
    button.hidden = isSignedIn;
    button.disabled = state.authPending;
  });

  elements.navPills.forEach((button) => {
    const target = button.dataset.target;
    const isVisibleTarget = target === "learn" || target === "community";
    button.hidden = !isVisibleTarget;
    button.disabled = false;
  });

  elements.authLogoutButtons.forEach((button) => {
    button.hidden = !isSignedIn;
    button.disabled = state.authPending;
  });

  if (elements.authChannelEmail) {
    elements.authChannelEmail.classList.toggle("active", !isUsernameChannel);
  }

  if (elements.authChannelUsername) {
    elements.authChannelUsername.classList.toggle("active", isUsernameChannel);
  }

  if (elements.authModeLogin) {
    elements.authModeLogin.classList.toggle("active", !isRegisterMode);
  }

  if (elements.authModeRegister) {
    elements.authModeRegister.classList.toggle("active", isRegisterMode);
  }

  if (elements.authEmailField) {
    elements.authEmailField.hidden = isUsernameChannel;
    elements.authEmailField.style.display = isUsernameChannel ? "none" : "";
  }

  if (elements.authEmail) {
    elements.authEmail.required = !isUsernameChannel;
    elements.authEmail.disabled = isUsernameChannel || state.authPending;
  }

  if (elements.authUsernameField) {
    elements.authUsernameField.hidden = !isUsernameChannel;
    elements.authUsernameField.style.display = isUsernameChannel ? "" : "none";
  }

  if (elements.authUsername) {
    elements.authUsername.required = isUsernameChannel;
    elements.authUsername.disabled = !isUsernameChannel || state.authPending;
  }

  if (elements.authCodeField) {
    elements.authCodeField.hidden = !shouldShowCode;
    elements.authCodeField.style.display = shouldShowCode ? "" : "none";
  }

  if (elements.authVerificationCode) {
    elements.authVerificationCode.required = shouldShowCode;
    elements.authVerificationCode.disabled = !shouldShowCode || state.authPending;
  }

  if (elements.authConfirmPasswordField) {
    elements.authConfirmPasswordField.hidden = !isRegisterMode;
    elements.authConfirmPasswordField.style.display = isRegisterMode ? "" : "none";
  }

  if (elements.authConfirmPassword) {
    elements.authConfirmPassword.required = isRegisterMode;
    elements.authConfirmPassword.disabled = !isRegisterMode || state.authPending;
  }

  if (elements.authFormHeading) {
    elements.authFormHeading.textContent = isUsernameChannel
      ? isRegisterMode
        ? "\u540d\u5b57\u6ce8\u518c"
        : "\u540d\u5b57\u767b\u5f55"
      : isRegisterMode
        ? "\u90ae\u7bb1\u6ce8\u518c"
        : "\u90ae\u7bb1\u767b\u5f55";
  }

  if (elements.authFormCopy) {
    elements.authFormCopy.textContent = isUsernameChannel
      ? isRegisterMode
        ? "\u76f4\u63a5\u7528\u540d\u5b57\u548c\u5bc6\u7801\u521b\u5efa\u8d26\u53f7\uff0c\u4e0d\u9700\u90ae\u7bb1\u9a8c\u8bc1\u3002"
        : "\u8f93\u5165\u4f60\u6ce8\u518c\u65f6\u7684\u540d\u5b57\u548c\u5bc6\u7801\u5373\u53ef\u767b\u5f55\u3002"
      : isRegisterMode
        ? "\u5148\u53d1\u9001\u90ae\u7bb1\u9a8c\u8bc1\u7801\uff0c\u518d\u7528\u90ae\u7bb1\u3001\u9a8c\u8bc1\u7801\u548c\u5bc6\u7801\u5b8c\u6210\u6ce8\u518c\u3002"
        : "\u4f7f\u7528\u90ae\u7bb1\u548c\u5bc6\u7801\u76f4\u63a5\u767b\u5f55\u3002";
  }

  if (elements.authSubmit) {
    elements.authSubmit.disabled = state.authPending;
    elements.authSubmit.textContent = state.authPending
      ? isRegisterMode
        ? "\u6ce8\u518c\u4e2d..."
        : "\u767b\u5f55\u4e2d..."
      : isRegisterMode
        ? "\u6ce8\u518c"
        : "\u767b\u5f55";
  }

  if (elements.authSendCode) {
    elements.authSendCode.hidden = !shouldShowCode;
    elements.authSendCode.disabled =
      !shouldShowCode || state.authCodePending || state.authPending || cooldownSeconds > 0;
    elements.authSendCode.textContent =
      cooldownSeconds > 0
        ? `${cooldownSeconds}s \u540e\u91cd\u53d1`
        : state.authCodePending
          ? "\u53d1\u9001\u4e2d..."
          : "\u53d1\u9001\u9a8c\u8bc1\u7801";
  }

  if (elements.authStatus) {
    elements.authStatus.textContent = state.authStatus || "";
    elements.authStatus.classList.toggle("error", state.authStatusTone === "error");
    elements.authStatus.classList.toggle("success", state.authStatusTone === "success");
  }

  if (elements.authDevHint) {
    elements.authDevHint.hidden = !state.authDevHint;
    elements.authDevHint.textContent = state.authDevHint || "";
  }
}

function openAuthView(message = "", tone = "info") {
  setAuthMode("login");
  state.authStatus = message;
  state.authStatusTone = tone;
  switchView("auth");
  renderAuth();
}

function requireSignedInForAction(message) {
  if (state.authUser) {
    return true;
  }

  openAuthView(message, "info");
  return false;
}

async function handleSendRegisterCode() {
  if (state.authChannel !== "email" || state.authMode !== "register") {
    return;
  }

  const email = elements.authEmail?.value?.trim() || "";

  state.authCodePending = true;
  state.authStatus = "\u6b63\u5728\u53d1\u9001\u9a8c\u8bc1\u7801...";
  state.authStatusTone = "info";
  state.authDevHint = "";
  renderAuth();

  try {
    const payload = await sendRegisterCodeApi({ email });
    state.authCodeCooldownUntil = Date.now() + (Number(payload.cooldownSeconds || 60) * 1000);
    state.authStatus = `\u9a8c\u8bc1\u7801\u5df2\u53d1\u9001\u5230 ${payload.sentTo}`;
    state.authStatusTone = "success";
    state.authDevHint = payload.devCode
      ? `\u5f00\u53d1\u73af\u5883\u9a8c\u8bc1\u7801\uff1a${payload.devCode}`
      : "";

    if (elements.authVerificationCode && payload.devCode) {
      elements.authVerificationCode.value = payload.devCode;
    }
  } catch (error) {
    state.authStatus = getErrorMessage(error, "\u53d1\u9001\u9a8c\u8bc1\u7801\u5931\u8d25");
    state.authStatusTone = "error";
  } finally {
    state.authCodePending = false;
    renderAuth();
  }
}

async function handleAuthSubmit(event) {
  event.preventDefault();

  const email = elements.authEmail?.value?.trim() || "";
  const username = elements.authUsername?.value?.trim() || "";
  const password = elements.authPassword?.value || "";
  const verificationCode = elements.authVerificationCode?.value?.trim() || "";
  const confirmPassword = elements.authConfirmPassword?.value || "";
  const isUsernameChannel = state.authChannel === "username";
  const isRegisterMode = state.authMode === "register";

  if (isUsernameChannel && !username) {
    state.authStatus = "\u8bf7\u5148\u8f93\u5165\u4f60\u7684\u540d\u5b57\u3002";
    state.authStatusTone = "error";
    renderAuth();
    return;
  }

  if (!isUsernameChannel && !email) {
    state.authStatus = "\u8bf7\u5148\u8f93\u5165\u90ae\u7bb1\u3002";
    state.authStatusTone = "error";
    renderAuth();
    return;
  }

  if (isRegisterMode && !isUsernameChannel && !verificationCode) {
    state.authStatus = "\u8bf7\u5148\u8f93\u5165\u90ae\u7bb1\u9a8c\u8bc1\u7801\u3002";
    state.authStatusTone = "error";
    renderAuth();
    return;
  }

  if (isRegisterMode && !confirmPassword) {
    state.authStatus = "\u8bf7\u518d\u8f93\u5165\u4e00\u6b21\u5bc6\u7801\u3002";
    state.authStatusTone = "error";
    renderAuth();
    return;
  }

  if (isRegisterMode && password !== confirmPassword) {
    state.authStatus = "\u4e24\u6b21\u8f93\u5165\u7684\u5bc6\u7801\u4e0d\u4e00\u81f4\u3002";
    state.authStatusTone = "error";
    renderAuth();
    return;
  }

  state.authPending = true;
  state.authStatus = isRegisterMode ? "\u6b63\u5728\u521b\u5efa\u8d26\u53f7..." : "\u6b63\u5728\u767b\u5f55...";
  state.authStatusTone = "info";
  renderAuth();

  try {
    let payload;

    if (isUsernameChannel) {
      payload = isRegisterMode
        ? await registerWithUsernameApi({ username, password })
        : await loginWithUsernameApi({ username, password });
    } else {
      payload = isRegisterMode
        ? await registerWithEmailApi({ email, password, verificationCode })
        : await loginWithEmailApi({ email, password });
    }

    await applyAuthSuccess(payload);
  } catch (error) {
    state.authStatus = getErrorMessage(error, isRegisterMode ? "\u6ce8\u518c\u5931\u8d25" : "\u767b\u5f55\u5931\u8d25");
    state.authStatusTone = "error";
  } finally {
    state.authPending = false;
    renderAuth();
  }
}

async function applyAuthSuccess(payload) {
  if (!payload?.token || !payload?.user) {
    throw new Error("\u767b\u5f55\u54cd\u5e94\u7f3a\u5c11\u4f1a\u8bdd\u4fe1\u606f\u3002");
  }

  state.authToken = payload.token;
  state.authUser = payload.user;
  state.authStatus = "\u767b\u5f55\u6210\u529f\u3002";
  state.authStatusTone = "success";
  state.authDevHint = "";
  persistAuthSession(payload.token, payload.user);
  resetAuthInputs();

  await refreshDeckFromServer({ preserveWordId: words[state.learnIndex]?.id || null, silent: true });
  await ensureCommunityFeedLoaded(true);
  renderAllViews();
  switchView("learn");
}

async function handleLogout() {
  const currentWordId = words[state.learnIndex]?.id || null;
  state.authPending = true;
  renderAuth();

  try {
    await logoutApi();
  } catch (error) {
    console.error(error);
  } finally {
    clearAuthSessionState();
    state.authStatus = "\u5df2\u9000\u51fa\u767b\u5f55\u3002";
    state.authStatusTone = "success";
    state.authPending = false;
    resetAuthInputs();
    await refreshDeckFromServer({ preserveWordId: currentWordId, silent: true });
    state.communityFeed = [];
    state.communityFeedLoaded = false;
    state.communityPostId = null;
    state.communityPostDetail = null;
    renderAllViews();
    switchView("auth");
  }
}

function clearAuthSessionState() {
  state.authToken = null;
  state.authUser = null;
  state.authDevHint = "";
  state.communityFeedMode = "hall";
  state.communityPublishOpen = false;
  state.communityPublishPending = false;
  state.communityPublishWordId = "";
  state.communityPublishImageId = null;
  state.communityPublishWordLabel = "";
  state.communityPublishDraft = "";
  state.communityPublishStatus = COMMUNITY_PUBLISH_DEFAULT_STATUS;
  state.communityPublishStatusTone = "info";
  clearStoredAuthSession();
}

function switchView(viewId) {
  const allowedViews = new Set(["auth", "learn", "community", "community-post", "review", "image", "stats", "welcome"]);
  const requestedView = allowedViews.has(viewId) ? viewId : "learn";
  const requiresAuth = requestedView !== "auth";
  const nextView = !state.authUser && requiresAuth ? "auth" : requestedView;

  if (isCompactSidebarLayout()) {
    state.sidebarDrawerOpen = false;
    syncSidebarVisibility();
  }

  state.currentView = nextView;
  setAccountMenuOpen(false);
  renderDockbar();

  if (nextView !== "learn" && state.learnListOpen) {
    setLearnDrawer(false);
  }

  if (nextView !== "learn" && state.communityPublishOpen) {
    closeCommunityPublishModal();
  }

  elements.views.forEach((view) => {
    const isActive = view.id === nextView;
    view.classList.toggle("active", isActive);
    view.hidden = !isActive;
  });

  elements.navPills.forEach((button) => {
    button.classList.toggle("active", button.dataset.target === nextView);
  });

  if (nextView === "welcome") {
    renderWelcome();
  }

  if (nextView === "learn") {
    renderLearn();
  }

  if (nextView === "community") {
    renderCommunityFeed();
    ensureCommunityFeedLoaded();
  }

  if (nextView === "community-post") {
    renderCommunityPostDetail();
  }

  if (nextView === "review") {
    renderReview();
  }

  if (nextView === "image") {
    renderImage();
  }

  if (nextView === "stats") {
    renderStats();
  }

  if (nextView === "auth") {
    renderAuth();
  }
}

function getAuthCodeCooldownSeconds() {
  return Math.max(0, Math.ceil((state.authCodeCooldownUntil - Date.now()) / 1000));
}

function resetAuthInputs() {
  if (elements.authUsername) {
    elements.authUsername.value = "";
  }

  if (elements.authPassword) {
    elements.authPassword.value = "";
  }

  if (elements.authVerificationCode) {
    elements.authVerificationCode.value = "";
  }

  if (elements.authConfirmPassword) {
    elements.authConfirmPassword.value = "";
  }
}

function getAccountAvatarText(value) {
  const normalizedValue = String(value || "").trim();

  if (!normalizedValue) {
    return "图";
  }

  return normalizedValue.slice(0, 2).toUpperCase();
}

function formatCount(value) {
  const count = Number(value || 0);

  if (count >= 10000) {
    return `${(count / 10000).toFixed(count >= 100000 ? 0 : 1)}w`;
  }

  return String(count);
}

function formatCommunityDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function normalizeCommunityPost(post) {
  if (!post) {
    return null;
  }

  return {
    ...post,
    imageUrl: resolveRuntimeUrl(post.imageUrl || "")
  };
}

function normalizeCommunityFeed(posts) {
  if (!Array.isArray(posts)) {
    return [];
  }

  return posts.map((post) => normalizeCommunityPost(post)).filter(Boolean);
}

function getCommunityFeedModeMeta() {
  if (state.communityFeedMode === "ranking") {
    return {
      title: "排行榜",
      note: "当前先按点赞、收藏、评论的热度排序，后面再接更细的推荐策略。"
    };
  }

  if (state.communityFeedMode === "mine") {
    return {
      title: "我的发布",
      note: "这里只看你自己发到社区的图片和短评。"
    };
  }

  return {
    title: "大厅",
    note: "当前先按发布时间浏览，后续这里会接推荐算法。"
  };
}

function compareCommunityRanking(left, right) {
  const likeDiff = Number(right.likeCount || 0) - Number(left.likeCount || 0);
  if (likeDiff !== 0) {
    return likeDiff;
  }

  const favoriteDiff = Number(right.favoriteCount || 0) - Number(left.favoriteCount || 0);
  if (favoriteDiff !== 0) {
    return favoriteDiff;
  }

  const commentDiff = Number(right.commentCount || 0) - Number(left.commentCount || 0);
  if (commentDiff !== 0) {
    return commentDiff;
  }

  return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
}

function isOwnCommunityPost(post) {
  if (!post || !state.authUser) {
    return false;
  }

  return Number(post.author?.id || 0) === Number(state.authUser.id || 0);
}

function getVisibleCommunityFeedPosts() {
  if (!Array.isArray(state.communityFeed)) {
    return [];
  }

  if (state.communityFeedMode === "ranking") {
    return [...state.communityFeed].sort(compareCommunityRanking);
  }

  if (state.communityFeedMode === "mine") {
    return state.communityFeed.filter((post) => isOwnCommunityPost(post));
  }

  return state.communityFeed;
}

function setCommunityFeedMode(mode) {
  const allowedModes = new Set(["hall", "ranking", "mine"]);
  const nextMode = allowedModes.has(mode) ? mode : "hall";

  if (state.communityFeedMode === nextMode) {
    renderCommunityFeed();
    return;
  }

  state.communityFeedMode = nextMode;
  renderCommunityFeed();
}

function syncCommunityFeedModeUi() {
  const modeMeta = getCommunityFeedModeMeta();

  elements.communityFeedModes.forEach((button) => {
    const isActive = button.dataset.communityFeedMode === state.communityFeedMode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (elements.communityFeedNote) {
    elements.communityFeedNote.textContent = `${modeMeta.title}：${modeMeta.note}`;
  }
}

function buildCommunityFeedEmptyState() {
  if (state.communityFeedMode === "mine") {
    return {
      title: "你还没有发布内容",
      copy: "从学习页长按图片，再点“发到社区”，就能把自己的词图和短评发出来。"
    };
  }

  if (state.communityFeedMode === "ranking") {
    return {
      title: "排行榜暂时空着",
      copy: "等大家开始点赞、收藏和评论后，这里就会出现热度更高的帖子。"
    };
  }

  return {
    title: "社区还没有内容",
    copy: "从学习页长按图片，再点“发到社区”，就能发出第一条单词帖子。"
  };
}

function buildCommunityWordMetaMarkup(post) {
  const items = [
    post.word?.example
      ? `<article class="community-word-meta-item"><span>例句</span><p>${escapeHtml(post.word.example)}</p></article>`
      : "",
    post.word?.exampleChinese
      ? `<article class="community-word-meta-item"><span>例句翻译</span><p>${escapeHtml(post.word.exampleChinese)}</p></article>`
      : "",
    post.word?.imageReason
      ? `<article class="community-word-meta-item"><span>记忆点</span><p>${escapeHtml(post.word.imageReason)}</p></article>`
      : "",
    post.word?.scene
      ? `<article class="community-word-meta-item"><span>联想场景</span><p>${escapeHtml(post.word.scene)}</p></article>`
      : ""
  ].filter(Boolean);

  return items.join("");
}

function renderWelcome() {
  elements.heroWordCount.textContent = String(words.length);

  if (elements.welcomeAuthButton) {
    elements.welcomeAuthButton.textContent = state.authUser ? "管理账号" : "登录 / 注册";
  }

  if (!hasDeckWords()) {
    elements.deckPreview.innerHTML = `
      <div class="deck-card active">
        <div>
          <strong>${state.authUser ? "当前词书暂无内容" : "请先登录"}</strong>
          <small>${state.authUser ? "换一本词书，或检查词书数据。" : "登录后才能查看单词、图片和词书。"}</small>
        </div>
      </div>
    `;
    return;
  }

  elements.deckPreview.innerHTML = words
    .slice(0, 4)
    .map(
      (word, index) => `
        <article class="deck-card ${index === state.learnIndex ? "active" : ""}">
          <img src="${getWordImages(word)[0].url}" alt="${word.english}" referrerpolicy="no-referrer" />
          <div>
            <strong>${word.english}</strong>
            <small>${word.chinese}</small>
          </div>
        </article>
      `
    )
    .join("");
}

function renderCommunityFeed() {
  if (!elements.communityFeed) {
    return;
  }

  syncCommunityFeedModeUi();

  if (!state.authUser) {
    elements.communityFeed.innerHTML = `
      <article class="card community-empty-card">
        <h3>请先登录</h3>
        <p>登录后才能查看社区、发布图片和参与评论。</p>
      </article>
    `;
    return;
  }

  if (state.communityFeedPending && state.communityFeed.length === 0) {
    elements.communityFeed.innerHTML = `
      <article class="card community-empty-card">
        <h3>社区加载中</h3>
        <p>正在同步最新帖子。</p>
      </article>
    `;
    return;
  }

  const visiblePosts = getVisibleCommunityFeedPosts();

  if (!Array.isArray(state.communityFeed) || state.communityFeed.length === 0 || visiblePosts.length === 0) {
    const emptyState = buildCommunityFeedEmptyState();
    elements.communityFeed.innerHTML = `
      <article class="card community-empty-card">
        <h3>${emptyState.title}</h3>
        <p>${emptyState.copy}</p>
      </article>
    `;
    return;
  }

  elements.communityFeed.innerHTML = visiblePosts
    .map(
      (post) => `
        <article class="community-card" data-community-post-id="${post.id}">
          <div class="community-card-media">
            <img src="${escapeHtml(post.imageUrl)}" alt="${escapeHtml(post.title)}" referrerpolicy="no-referrer" />
          </div>
          <div class="community-card-body">
            <div class="community-card-meta">
              <div class="community-card-author">
                <span class="community-avatar small">${escapeHtml(post.author.avatarText)}</span>
                <span>${escapeHtml(post.author.displayName || post.author.email)}</span>
              </div>
              <span class="community-card-date">${formatCommunityDate(post.createdAt)}</span>
            </div>
            <div class="community-card-copy">
              <h3>${escapeHtml(post.title)}</h3>
              <p>${escapeHtml(post.body || "这条帖子还没有写短评。")}</p>
            </div>
            <div class="community-card-stats" aria-label="帖子互动数据">
              <span class="community-card-stat"><span aria-hidden="true">❤</span> ${formatCount(post.likeCount)}</span>
              <span class="community-card-stat"><span aria-hidden="true">★</span> ${formatCount(post.favoriteCount)}</span>
              <span class="community-card-stat"><span aria-hidden="true">💬</span> ${formatCount(post.commentCount)}</span>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function renderCommunityPostDetail() {
  if (!elements.communityPostTitle) {
    return;
  }

  const post = state.communityPostDetail;

  if (!post) {
    setImageWithFallback(elements.communityPostImage, [], 0, "");
    elements.communityPostAvatar.textContent = "W";
    elements.communityPostAuthorName.textContent = "";
    elements.communityPostCreatedAt.textContent = "";
    elements.communityPostTitle.textContent = state.communityPostPending ? "加载中..." : "";
    elements.communityPostSubtitle.textContent = "";
    elements.communityPostDescription.textContent = "";
    elements.communityPostDescription.classList.remove("is-empty");
    if (elements.communityPostWordPanel) {
      elements.communityPostWordPanel.hidden = true;
    }
    elements.communityPostWordMeta.innerHTML = "";
    elements.communityPostLikeCount.textContent = "0";
    elements.communityPostFavoriteCount.textContent = "0";
    elements.communityPostCommentCount.textContent = "0";
    if (elements.communityPostFavoriteLabel) {
      elements.communityPostFavoriteLabel.textContent = "☆";
    }
    elements.communityPostLike.classList.remove("is-active");
    elements.communityPostFavorite.classList.remove("is-active");
    elements.communityPostLike.disabled = true;
    elements.communityPostFavorite.disabled = true;
    elements.communityCommentSubmit.disabled = true;
    elements.communityCommentSubmit.textContent = "发表评论";
    if (elements.communityCommentInput) {
      elements.communityCommentInput.value = "";
    }
    if (elements.communityCommentList) {
      elements.communityCommentList.innerHTML = state.communityPostPending
        ? '<div class="community-empty-inline">正在加载帖子详情...</div>'
        : "";
    }
    return;
  }

  setImageWithFallback(elements.communityPostImage, post.imageUrl ? [{ url: post.imageUrl }] : [], 0, post.title);
  elements.communityPostAvatar.textContent = post.author.avatarText;
  elements.communityPostAuthorName.textContent = post.author.displayName || post.author.email;
  elements.communityPostCreatedAt.textContent = formatCommunityDate(post.createdAt);
  elements.communityPostTitle.textContent = post.title;
  elements.communityPostSubtitle.textContent = `${post.word.english} · ${post.word.chinese}`;
  elements.communityPostDescription.textContent = post.body || "这条帖子还没有写短评。";
  elements.communityPostDescription.classList.toggle("is-empty", !post.body);
  const wordMetaMarkup = buildCommunityWordMetaMarkup(post);
  if (elements.communityPostWordPanel) {
    elements.communityPostWordPanel.hidden = !wordMetaMarkup;
  }
  elements.communityPostWordMeta.innerHTML = wordMetaMarkup;
  elements.communityPostLikeCount.textContent = formatCount(post.likeCount);
  elements.communityPostFavoriteCount.textContent = formatCount(post.favoriteCount);
  elements.communityPostCommentCount.textContent = formatCount(post.commentCount);
  elements.communityPostLike.classList.toggle("is-active", Boolean(post.viewer?.liked));
  elements.communityPostFavorite.classList.toggle("is-active", Boolean(post.viewer?.favorited));
  const isOwnPost = isOwnCommunityPost(post);
  const isFavorited = Boolean(post.viewer?.favorited);
  if (elements.communityPostFavoriteLabel) {
    elements.communityPostFavoriteLabel.textContent = isFavorited ? "★" : "☆";
  }
  elements.communityPostLike.disabled = state.communityPostPending;
  elements.communityPostFavorite.disabled = state.communityPostPending || isOwnPost || isFavorited;
  elements.communityPostFavorite.setAttribute(
    "aria-label",
    isFavorited ? "已收藏到我的词图" : "收藏到我的词图"
  );
  elements.communityCommentSubmit.disabled = state.communityCommentPending;
  elements.communityCommentSubmit.textContent = state.communityCommentPending ? "发送中..." : "发表评论";

  elements.communityCommentList.innerHTML =
    Array.isArray(post.comments) && post.comments.length > 0
      ? post.comments
          .map(
            (comment) => `
              <article class="community-comment-item">
                <div class="community-comment-head">
                  <div class="community-card-author">
                    <span class="community-avatar small">${escapeHtml(comment.author.avatarText)}</span>
                    <span>${escapeHtml(comment.author.displayName || comment.author.email)}</span>
                  </div>
                  <span class="community-comment-time">${formatCommunityDate(comment.createdAt)}</span>
                </div>
                <p class="community-comment-content">${escapeHtml(comment.content)}</p>
                <div class="community-comment-foot">
                  <button
                    class="text-link community-comment-like ${comment.viewer?.liked ? "is-active" : ""}"
                    type="button"
                    data-community-comment-id="${comment.id}"
                  >
                    点赞 ${formatCount(comment.likeCount)}
                  </button>
                </div>
              </article>
            `
          )
          .join("")
      : '<div class="community-empty-inline">还没有评论，来做第一个回复的人。</div>';
}

function renderLearn() {
  syncBookSelector();
  syncLearnListSearch();

  if (!hasDeckWords()) {
    const placeholderImage = buildEmptyImagePlaceholder({
      id: "deck-locked",
      english: state.authUser ? "No words" : "Sign in"
    });

    elements.learnProgress.textContent = state.authUser ? "暂无单词" : "请先登录";
    elements.learnListToggle.disabled = true;
    setImageWithFallback(
      elements.learnImage,
      [placeholderImage],
      0,
      state.authUser ? "当前词书暂无单词" : "请先登录"
    );
    elements.learnMedia.classList.remove("is-switchable", "is-manage-open");
    elements.learnWord.textContent = state.authUser ? "当前词书暂无单词" : "请先登录";
    elements.learnTranslation.textContent = state.authUser
      ? "这个词书暂时没有可学习的单词。"
      : "登录后才能查看单词卡片和个人图片。";
    elements.learnExample.textContent = state.authUser
      ? "可以切换到别的词书，或者检查后端 seed 数据。"
      : "邮箱登录成功后，系统才会加载你的词书和图片。";
    elements.learnExampleTranslation.textContent = "";
    elements.learnPrev.disabled = true;
    elements.learnNext.disabled = true;
    elements.learnNext.textContent = state.authUser ? "暂无内容" : "请先登录";
    renderWordList();
    syncLearnListVisibility();
    renderWelcome();
    return;
  }

  const word = words[state.learnIndex];
  const images = getWordImages(word);
  const hasExample = hasExampleText(word);
  const exampleCopy = hasExample
    ? {
        example: word.example,
        exampleChinese: word.exampleChinese || ""
      }
    : getExampleFallbackCopy();

  elements.learnProgress.textContent = `${state.learnIndex + 1} / ${words.length}`;
  elements.learnListToggle.disabled = false;
  setImageWithFallback(elements.learnImage, images, state.learnImageIndex, `${word.english} 的真实图片`);
  elements.learnMedia.classList.toggle("is-switchable", images.length > 1 && !state.learnDeleteMenuOpen);
  elements.learnMedia.classList.toggle("is-manage-open", state.learnDeleteMenuOpen);
  elements.learnWord.textContent = word.english;
  elements.learnTranslation.textContent = word.chinese;
  elements.learnExample.textContent = exampleCopy.example;
  elements.learnExampleTranslation.textContent = exampleCopy.exampleChinese;
  elements.learnExample.classList.toggle("is-empty", !hasExample);
  elements.learnExampleTranslation.classList.toggle("is-empty", !hasExample);
  elements.learnExampleAudio.disabled = !hasExample;
  elements.learnExampleAudio.setAttribute(
    "aria-label",
    hasExample ? "朗读例句" : "当前单词暂无例句可朗读"
  );

  elements.learnPrev.disabled = state.learnIndex === 0;
  elements.learnNext.disabled = false;
  elements.learnNext.textContent = state.learnIndex === words.length - 1 ? "回到第一张" : "下一张";

  renderWordList();
  syncLearnListVisibility();
  renderWelcome();
}

function syncBookSelector() {
  if (!elements.bookSelect) {
    return;
  }

  if (!Array.isArray(state.books) || state.books.length === 0) {
    elements.bookSelect.innerHTML = '<option value="">当前词书</option>';
    elements.bookSelect.disabled = true;
    return;
  }

  elements.bookSelect.innerHTML = state.books
    .map((book) => {
      const isSelected = book.code === state.activeBookCode;
      const label = `${book.name}${Number.isFinite(book.wordCount) ? ` (${book.wordCount})` : ""}`;
      return `<option value="${escapeHtml(book.code)}" ${isSelected ? "selected" : ""}>${escapeHtml(label)}</option>`;
    })
    .join("");
  elements.bookSelect.disabled = state.authPending || !state.authUser;
}

async function handleBookChange(event) {
  const nextBookCode = event.target.value;

  if (!nextBookCode || nextBookCode === state.activeBookCode) {
    return;
  }

  state.activeBookCode = nextBookCode;
  await refreshDeckFromServer({ silent: true });
  renderAllViews();
  switchView("learn");
}

function syncLearnListVisibility() {
  const isOpen = state.learnListOpen;
  elements.learnDrawer.classList.toggle("is-open", isOpen);
  elements.learnDrawer.setAttribute("aria-hidden", String(!isOpen));
  elements.learnListToggle.setAttribute("aria-expanded", String(isOpen));
  if (elements.learnListToggleLabel) {
    elements.learnListToggleLabel.textContent = isOpen ? "收起单词列表" : "单词列表";
  }
  document.body.classList.toggle("drawer-open", isOpen);
}

function syncLearnListSearch() {
  if (!elements.learnListSearch) {
    return;
  }

  elements.learnListSearch.value = state.learnListQuery;
  elements.learnListSearch.disabled = !hasDeckWords();
}

function renderWordList() {
  if (!elements.wordList) {
    return;
  }

  if (!hasDeckWords()) {
    elements.wordList.innerHTML = "";
    return;
  }

  const query = state.learnListQuery.trim().toLowerCase();
  const filteredWords = words
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => {
      if (!query) {
        return true;
      }

      return `${item.english} ${item.chinese}`.toLowerCase().includes(query);
    });

  if (filteredWords.length === 0) {
    elements.wordList.innerHTML = '<div class="word-list-empty">没有匹配的单词</div>';
    return;
  }

  elements.wordList.innerHTML = filteredWords
    .map(
      ({ item, index }) => `
        <button class="word-chip ${index === state.learnIndex ? "active" : ""}" data-word-index="${index}">
          <span>
            <strong>${String(index + 1).padStart(2, "0")} ${escapeHtml(item.english)}</strong>
            <small>${escapeHtml(item.chinese)}</small>
          </span>
          <small>${escapeHtml(state.reviewRatingsByWord[index] ? ratingLabel(state.reviewRatingsByWord[index]) : "未复习")}</small>
        </button>
      `
    )
    .join("");
}

function setLearnDrawer(isOpen) {
  state.learnListOpen = isOpen;
  if (!isOpen && state.learnListQuery) {
    state.learnListQuery = "";
    syncLearnListSearch();
    renderWordList();
  }
  syncLearnListVisibility();
}

function setLearnDeleteMenu(isOpen) {
  if (!elements.learnImageMenu || !elements.learnImageDelete) {
    return;
  }

  if (!hasDeckWords()) {
    state.learnDeleteMenuOpen = false;
    elements.learnImageMenu.hidden = true;
    elements.learnImageMenu.setAttribute("aria-hidden", "true");
    elements.learnImageDelete.disabled = true;
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

  if (!hasDeckWords()) {
    const placeholderImage = buildEmptyImagePlaceholder({
      id: "review-locked",
      english: state.authUser ? "No review words" : "Sign in"
    });

    elements.reviewCounts.know.textContent = "0";
    elements.reviewCounts.fuzzy.textContent = "0";
    elements.reviewCounts.unknown.textContent = "0";
    elements.reviewProgress.textContent = "暂无复习内容";
    elements.reviewSuggestion.textContent = state.authUser
      ? "当前词书为空，暂时没有复习内容。"
      : "登录后才能进入复习模式。";
    setImageWithFallback(
      elements.reviewImage,
      [placeholderImage],
      0,
      state.authUser ? "当前没有可复习单词" : "请先登录"
    );
    elements.reviewWord.textContent = state.authUser ? "当前没有可复习单词" : "请先登录";
    elements.reviewPromptText.textContent = state.authUser
      ? "换一本词书，或者检查后端 seed 数据。"
      : "登录成功后会自动加载你的词书。";
    elements.reviewTranslation.textContent = state.authUser ? "暂无可复习词卡" : "未登录无法查看词卡";
    elements.reviewAnswer.classList.add("revealed");
    elements.reviewReveal.disabled = true;
    elements.rateButtons.forEach((button) => {
      button.disabled = true;
    });
    return;
  }

  elements.reviewCounts.know.textContent = String(counts.know);
  elements.reviewCounts.fuzzy.textContent = String(counts.fuzzy);
  elements.reviewCounts.unknown.textContent = String(counts.unknown);
  elements.reviewProgress.textContent = `复习进度 ${Math.min(state.reviewIndex + 1, total)} / ${total}`;
  elements.reviewSuggestion.textContent = buildReviewSuggestion(counts);

  if (state.reviewIndex >= total) {
    const lastWord = words[state.reviewOrder[total - 1]];
    setImageWithFallback(elements.reviewImage, getWordImages(lastWord), 0, "复习完成");
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
  setImageWithFallback(elements.reviewImage, getWordImages(word), state.reviewIndex, `${word.english} 的复习图片`);
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

  if (!hasDeckWords()) {
    const placeholderImage = buildEmptyImagePlaceholder({
      id: "image-locked",
      english: state.authUser ? "No image quiz" : "Sign in"
    });

    elements.imageProgress.textContent = state.authUser ? "当前词书暂无题目" : "请先登录";
    setImageWithFallback(
      elements.imageVisual,
      [placeholderImage],
      0,
      state.authUser ? "当前词书暂无题目" : "请先登录"
    );
    elements.imagePromptText.textContent = state.authUser
      ? "当前词书没有足够的单词来生成题目。"
      : "登录后才能进入看图猜词。";
    elements.imageReason.textContent = state.authUser
      ? "切换词书，或者检查后端词书数据。"
      : "登录成功后会自动加载你的词书题目。";
    elements.imageOptions.innerHTML = "";
    elements.imageResult.innerHTML = "";
    elements.imageNext.disabled = true;
    elements.imageReset.disabled = true;
    return;
  }

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
  elements.imageProgress.textContent = `看图猜词 ${state.imageIndex + 1} / ${total}`;
  setImageWithFallback(elements.imageVisual, getWordImages(word), state.imageIndex, `${word.english} 的猜词图片`);
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
  elements.imageReset.disabled = false;
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

  if (!hasDeckWords()) {
    elements.stats.reviewBars.innerHTML = "";
    elements.stats.wordStatusList.innerHTML = `
      <div class="summary-item">
        <div>
          <p><strong>${state.authUser ? "当前没有可统计内容" : "请先登录"}</strong></p>
        </div>
        <span class="status-pill new">${state.authUser ? "空词书" : "未登录"}</span>
      </div>
    `;
    return;
  }

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
  if (!hasDeckWords()) {
    if (!state.authUser) {
      openAuthView("\u8bf7\u5148\u767b\u5f55\u540e\u518d\u67e5\u770b\u8bcd\u5361\u3002", "info");
    }
    return;
  }

  setLearnDeleteMenu(false);
  state.learnIndex = index;
  state.learnImageIndex = 0;
  state.learnedSet.add(index);
  setLearnDrawer(false);
  switchView("learn");
  renderLearn();
  renderStats();
}

async function ensureCommunityFeedLoaded(force = false) {
  if (!state.authUser || !state.authToken) {
    state.communityFeed = [];
    state.communityFeedLoaded = false;
    renderCommunityFeed();
    return;
  }

  if (state.communityFeedPending || (state.communityFeedLoaded && !force)) {
    return;
  }

  state.communityFeedPending = true;
  renderCommunityFeed();

  try {
    const payload = await fetchCommunityFeedApi();
    state.communityFeed = normalizeCommunityFeed(payload.posts);
    state.communityFeedLoaded = true;
  } catch (error) {
    handlePossibleAuthError(error);
    console.error(error);
    window.alert(getErrorMessage(error, "加载社区失败"));
  } finally {
    state.communityFeedPending = false;
    renderCommunityFeed();
  }
}

async function openCommunityPostDetail(postId) {
  if (!postId || !requireSignedInForAction("请先登录后再进入社区。")) {
    return;
  }

  state.communityPostPending = true;
  state.communityPostId = postId;
  state.communityPostDetail = null;
  switchView("community-post");

  try {
    const payload = await fetchCommunityPostDetailApi(postId);
    state.communityPostDetail = normalizeCommunityPost(payload.post || null);
    renderCommunityPostDetail();
  } catch (error) {
    handlePossibleAuthError(error);
    console.error(error);
    window.alert(getErrorMessage(error, "加载帖子详情失败"));
    state.communityPostId = null;
    state.communityPostDetail = null;
    switchView("community");
  } finally {
    state.communityPostPending = false;
    renderCommunityPostDetail();
  }
}

function openCommunityPublishModal() {
  if (!requireSignedInForAction("请先登录后再发到社区。")) {
    return;
  }

  if (!hasDeckWords()) {
    return;
  }

  const currentWord = words[state.learnIndex];
  const currentImage = getWordImages(currentWord)[Math.min(state.learnImageIndex, getWordImages(currentWord).length - 1)];

  if (!currentImage || typeof currentImage.id !== "number") {
    window.alert("这张图片还不能发布到社区，请先使用当前词卡里的真实图片记录。");
    return;
  }

  if (state.learnSearchOpen) {
    closeLearnSearchModal();
  }

  if (state.learnUploadOpen) {
    closeLearnUploadModal();
  }

  setLearnDeleteMenu(false);
  state.communityPublishOpen = true;
  state.communityPublishPending = false;
  state.communityPublishWordId = currentWord.id;
  state.communityPublishImageId = currentImage.id;
  state.communityPublishWordLabel = `${currentWord.english} · ${currentWord.chinese}`;
  state.communityPublishDraft = "";
  state.communityPublishStatus = COMMUNITY_PUBLISH_DEFAULT_STATUS;
  state.communityPublishStatusTone = "info";
  syncCommunityPublishModal();

  window.requestAnimationFrame(() => {
    if (elements.communityPublishInput) {
      elements.communityPublishInput.focus({ preventScroll: true });
    }
  });
}

function closeCommunityPublishModal() {
  if (state.communityPublishPending) {
    return;
  }

  state.communityPublishOpen = false;
  state.communityPublishWordId = "";
  state.communityPublishImageId = null;
  state.communityPublishWordLabel = "";
  state.communityPublishDraft = "";
  state.communityPublishStatus = COMMUNITY_PUBLISH_DEFAULT_STATUS;
  state.communityPublishStatusTone = "info";
  syncCommunityPublishModal();
}

function syncCommunityPublishModal() {
  if (
    !elements.communityPublishModal ||
    !elements.communityPublishCopy ||
    !elements.communityPublishInput ||
    !elements.communityPublishStatus ||
    !elements.communityPublishSubmit
  ) {
    return;
  }

  const submitLabel = state.communityPublishPending ? "发布中..." : "发布到社区";

  elements.communityPublishModal.hidden = !state.communityPublishOpen;
  elements.communityPublishModal.setAttribute("aria-hidden", String(!state.communityPublishOpen));
  elements.communityPublishCopy.textContent = state.communityPublishWordLabel
    ? `给 ${state.communityPublishWordLabel} 这张图配一句短评、联想或记忆提示。`
    : "给这张图配一句短评、联想或记忆提示。";
  elements.communityPublishInput.value = state.communityPublishDraft;
  elements.communityPublishInput.disabled = state.communityPublishPending;
  elements.communityPublishStatus.textContent = state.communityPublishStatus;
  elements.communityPublishStatus.classList.toggle("error", state.communityPublishStatusTone === "error");
  elements.communityPublishStatus.classList.toggle("success", state.communityPublishStatusTone === "success");
  elements.communityPublishSubmit.disabled = state.communityPublishPending;
  elements.communityPublishSubmit.textContent = submitLabel;

  if (elements.communityPublishCancel) {
    elements.communityPublishCancel.disabled = state.communityPublishPending;
  }
}

async function submitCommunityPublish() {
  const body = String(state.communityPublishDraft || "").trim();

  if (!state.communityPublishOpen || state.communityPublishPending) {
    return;
  }

  if (!state.communityPublishWordId || typeof state.communityPublishImageId !== "number") {
    state.communityPublishStatus = "当前图片状态已变化，请重新长按后发布。";
    state.communityPublishStatusTone = "error";
    syncCommunityPublishModal();
    return;
  }

  if (!body) {
    state.communityPublishStatus = "先写一句评价、短语联想或记忆提示。";
    state.communityPublishStatusTone = "error";
    syncCommunityPublishModal();
    if (elements.communityPublishInput) {
      elements.communityPublishInput.focus({ preventScroll: true });
    }
    return;
  }

  state.communityPublishPending = true;
  state.communityPublishStatus = "正在发布到社区...";
  state.communityPublishStatusTone = "info";
  if (elements.learnImagePublish) {
    elements.learnImagePublish.disabled = true;
    elements.learnImagePublish.textContent = "发布中...";
  }
  syncCommunityPublishModal();

  try {
    const payload = await publishCommunityPostApi({
      wordId: state.communityPublishWordId,
      wordImageId: state.communityPublishImageId,
      body
    });
    await ensureCommunityFeedLoaded(true);
    state.communityPostDetail = normalizeCommunityPost(payload.post || null);
    state.communityPostId = payload.post?.id || null;
    state.communityPublishPending = false;
    closeCommunityPublishModal();
    switchView("community-post");
    renderCommunityPostDetail();
  } catch (error) {
    handlePossibleAuthError(error);
    console.error(error);
    state.communityPublishStatus = getErrorMessage(error, "发布到社区失败");
    state.communityPublishStatusTone = "error";
    syncCommunityPublishModal();
  } finally {
    state.communityPublishPending = false;
    if (elements.learnImagePublish) {
      elements.learnImagePublish.disabled = false;
      elements.learnImagePublish.textContent = "发到社区";
    }
    syncCommunityPublishModal();
  }
}

async function toggleCommunityPostLike() {
  if (!state.communityPostDetail?.id || state.communityPostPending) {
    return;
  }

  state.communityPostPending = true;
  renderCommunityPostDetail();

  try {
    const payload = await toggleCommunityPostLikeApi(state.communityPostDetail.id);
    state.communityPostDetail = normalizeCommunityPost(payload.post || state.communityPostDetail);
    syncCommunityFeedPost(state.communityPostDetail);
    renderCommunityFeed();
  } catch (error) {
    handlePossibleAuthError(error);
    console.error(error);
    window.alert(getErrorMessage(error, "点赞失败"));
  } finally {
    state.communityPostPending = false;
    renderCommunityPostDetail();
  }
}

async function favoriteCommunityPost() {
  if (!state.communityPostDetail?.id || state.communityPostPending) {
    return;
  }

  if (isOwnCommunityPost(state.communityPostDetail)) {
    return;
  }

  if (state.communityPostDetail.viewer?.favorited) {
    window.alert("这张图已经收藏到你的词图里了。");
    return;
  }

  const wordLabel = state.communityPostDetail.word?.english || state.communityPostDetail.title || "这个单词";
  const shouldContinue = window.confirm(`收藏后，这张图会加入你自己的「${wordLabel}」图片库。确定继续吗？`);

  if (!shouldContinue) {
    return;
  }

  state.communityPostPending = true;
  renderCommunityPostDetail();

  try {
    const payload = await favoriteCommunityPostApi(state.communityPostDetail.id);
    state.communityPostDetail = normalizeCommunityPost(payload.post || state.communityPostDetail);
    if (payload.word) {
      updateWordInDeck(payload.word);
    }
    syncCommunityFeedPost(state.communityPostDetail);
    renderCommunityFeed();
  } catch (error) {
    handlePossibleAuthError(error);
    console.error(error);
    window.alert(getErrorMessage(error, "收藏失败"));
  } finally {
    state.communityPostPending = false;
    renderCommunityPostDetail();
  }
}

async function submitCommunityComment() {
  if (!state.communityPostDetail?.id || state.communityCommentPending || !elements.communityCommentInput) {
    return;
  }

  const content = String(elements.communityCommentInput.value || "").trim();

  if (!content) {
    return;
  }

  state.communityCommentPending = true;
  renderCommunityPostDetail();

  try {
    const payload = await createCommunityCommentApi(state.communityPostDetail.id, { content });
    state.communityPostDetail = normalizeCommunityPost(payload.post || state.communityPostDetail);
    syncCommunityFeedPost(state.communityPostDetail);
    elements.communityCommentInput.value = "";
    renderCommunityFeed();
  } catch (error) {
    handlePossibleAuthError(error);
    console.error(error);
    window.alert(getErrorMessage(error, "评论失败"));
  } finally {
    state.communityCommentPending = false;
    renderCommunityPostDetail();
  }
}

async function toggleCommunityCommentLike(commentId) {
  if (!commentId || state.communityCommentPending || !state.communityPostDetail) {
    return;
  }

  try {
    const payload = await toggleCommunityCommentLikeApi(commentId);
    const nextComment = payload.comment;

    state.communityPostDetail.comments = state.communityPostDetail.comments.map((comment) =>
      comment.id === nextComment.id ? nextComment : comment
    );
    renderCommunityPostDetail();
  } catch (error) {
    handlePossibleAuthError(error);
    console.error(error);
    window.alert(getErrorMessage(error, "评论点赞失败"));
  }
}

function syncCommunityFeedPost(postDetail) {
  if (!postDetail || !Array.isArray(state.communityFeed)) {
    return;
  }

  state.communityFeed = state.communityFeed.map((post) =>
    post.id === postDetail.id
      ? {
          ...post,
          likeCount: postDetail.likeCount,
          favoriteCount: postDetail.favoriteCount,
          commentCount: postDetail.commentCount,
          shareCount: postDetail.shareCount,
          viewer: { ...postDetail.viewer }
        }
      : post
  );
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
  if (images.length === 0) {
    return [buildEmptyImagePlaceholder(word)];
  }

  const uniqueImages = images.filter(
    (image, index, collection) => collection.findIndex((candidate) => candidate.url === image.url) === index
  );
  const removedUrls = state.dataSource === "local" ? new Set(state.removedImagesByWord[word.id] || []) : new Set();
  const visibleImages = uniqueImages.filter((image) => !removedUrls.has(image.url));
  const candidateImages = visibleImages.length > 0 ? visibleImages : uniqueImages.slice(0, 1);
  const defaultBingImage = candidateImages.find(
    (image) => image?.scope === "default" && image?.source === "Bing URL"
  );

  if (defaultBingImage) {
    return [defaultBingImage];
  }

  const defaultImage = candidateImages.find((image) => image?.scope === "default");

  if (defaultImage) {
    return [defaultImage];
  }

  return candidateImages;
}

function getRoundImage(word, roundIndex) {
  const images = getWordImages(word);
  return images[roundIndex % images.length];
}

function setImageWithFallback(imageElement, imageCandidates, preferredIndex, altText) {
  if (!imageElement) {
    return;
  }

  const urls = (Array.isArray(imageCandidates) ? imageCandidates : [])
    .map((image) => image?.url)
    .filter(Boolean);
  const safeUrls = urls.length > 0 ? urls : [buildEmptyImagePlaceholder({ id: "fallback-image" }).url];
  const safeIndex = Math.min(Math.max(Number(preferredIndex) || 0, 0), safeUrls.length - 1);

  imageElement.dataset.fallbackUrls = JSON.stringify(safeUrls);
  imageElement.dataset.fallbackIndex = String(safeIndex);
  imageElement.classList.remove("is-broken-image");
  imageElement.alt = altText || "";
  imageElement.src = safeUrls[safeIndex];
}

function handleImageFallback(event) {
  const imageElement = event.currentTarget;
  let urls = [];

  try {
    const parsedUrls = JSON.parse(imageElement.dataset.fallbackUrls || "[]");
    urls = Array.isArray(parsedUrls) ? parsedUrls.filter(Boolean) : [];
  } catch (error) {
    urls = [];
  }

  let nextIndex = Number(imageElement.dataset.fallbackIndex || 0) + 1;

  while (nextIndex < urls.length) {
    const nextUrl = urls[nextIndex];
    imageElement.dataset.fallbackIndex = String(nextIndex);

    if (nextUrl && imageElement.src !== nextUrl) {
      if (imageElement === elements.learnImage) {
        state.learnImageIndex = nextIndex;
      }

      imageElement.src = nextUrl;
      return;
    }

    nextIndex += 1;
  }

  imageElement.classList.add("is-broken-image");
}

function prepareImageQuestion() {
  if (!hasDeckWords()) {
    state.imageChoices = [];
    return;
  }

  if (state.imageIndex >= state.imageOrder.length) {
    return;
  }

  const correctIndex = state.imageOrder[state.imageIndex];
  const distractors = shuffle(words.map((_, index) => index).filter((index) => index !== correctIndex)).slice(0, 3);

  state.imageChoices = shuffle([correctIndex, ...distractors]);
}

function handleImageAnswer(selectedIndex) {
  if (!hasDeckWords()) {
    return;
  }

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
  if (!hasDeckWords()) {
    state.imageOrder = [];
    state.imageIndex = 0;
    state.imageAnswered = false;
    state.imageScore = 0;
    state.imageAttempts = 0;
    state.imageChoices = [];
    state.imageLastCorrect = false;
    state.imageSelectedIndex = null;
    renderImage();
    renderStats();
    return;
  }

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

function openLearnSearchModal() {
  if (!requireSignedInForAction("\u8bf7\u5148\u767b\u5f55\uff0c\u7136\u540e\u518d\u4e0a\u7f51\u641c\u56fe\u3002")) {
    return;
  }

  if (!hasDeckWords()) {
    return;
  }

  const currentWord = words[state.learnIndex];

  if (state.learnUploadOpen) {
    closeLearnUploadModal();
  }

  setLearnDeleteMenu(false);
  state.learnSearchOpen = true;
  state.learnSearchPending = false;
  state.learnSearchImportingId = null;
  state.learnSearchQuery = currentWord?.english || "";
  state.learnSearchStatus = "";
  state.learnSearchResults = [];
  state.learnSearchRequestId += 1;
  syncLearnSearchModal();

  window.requestAnimationFrame(() => {
    if (elements.learnSearchInput) {
      elements.learnSearchInput.focus({ preventScroll: true });
      elements.learnSearchInput.select();
    }
  });

  searchLearnImages(state.learnSearchQuery);
}

function closeLearnSearchModal() {
  if (state.learnSearchImportingId) {
    return;
  }

  state.learnSearchOpen = false;
  state.learnSearchPending = false;
  state.learnSearchImportingId = null;
  state.learnSearchQuery = "";
  state.learnSearchStatus = "";
  state.learnSearchResults = [];
  state.learnSearchRequestId += 1;
  syncLearnSearchModal();
}

function syncLearnSearchModal() {
  if (
    !elements.learnSearchModal ||
    !elements.learnSearchInput ||
    !elements.learnSearchSubmit ||
    !elements.learnSearchStatus ||
    !elements.learnSearchResults
  ) {
    return;
  }

  const isBusy = state.learnSearchPending || Boolean(state.learnSearchImportingId);

  elements.learnSearchModal.hidden = !state.learnSearchOpen;
  elements.learnSearchModal.setAttribute("aria-hidden", String(!state.learnSearchOpen));
  elements.learnSearchInput.value = state.learnSearchQuery;
  elements.learnSearchInput.disabled = Boolean(state.learnSearchImportingId);
  elements.learnSearchSubmit.disabled = isBusy;
  elements.learnSearchSubmit.textContent = state.learnSearchPending ? "Searching..." : "Search";
  elements.learnSearchStatus.textContent = state.learnSearchStatus;
  renderLearnSearchResults();
}

function renderLearnSearchResults() {
  if (!elements.learnSearchResults) {
    return;
  }

  elements.learnSearchResults.innerHTML = state.learnSearchResults
    .map((result) => {
      const isImporting = state.learnSearchImportingId === result.id;
      const title = escapeHtml(result.title || state.learnSearchQuery || "Image result");
      const thumbnailUrl = escapeHtml(result.thumbnailUrl || result.mediaUrl);
      const classNames = ["learn-search-result"];

      if (isImporting) {
        classNames.push("is-loading");
      }

      return `
        <button
          class="${classNames.join(" ")}"
          data-search-result-id="${escapeHtml(result.id)}"
          type="button"
          aria-label="${isImporting ? `Importing ${title}` : `Import ${title}`}"
          ${state.learnSearchPending || state.learnSearchImportingId ? "disabled" : ""}
        >
          <div class="learn-search-thumb">
            <img src="${thumbnailUrl}" alt="${title}" loading="lazy" decoding="async" referrerpolicy="no-referrer" />
          </div>
        </button>
      `;
    })
    .join("");
}

async function searchLearnImages(query) {
  const normalizedQuery = String(query || "").trim();
  const requestId = state.learnSearchRequestId + 1;

  state.learnSearchQuery = normalizedQuery;
  state.learnSearchRequestId = requestId;
  state.learnSearchImportingId = null;

  if (!normalizedQuery) {
    state.learnSearchPending = false;
    state.learnSearchResults = [];
    state.learnSearchStatus = LEARN_SEARCH_EMPTY_STATUS;
    syncLearnSearchModal();
    return;
  }

  state.learnSearchPending = true;
  state.learnSearchResults = [];
  state.learnSearchStatus = "Searching...";
  syncLearnSearchModal();

  try {
    const payload = await searchBingImagesApi(normalizedQuery);

    if (state.learnSearchRequestId !== requestId) {
      return;
    }

    state.learnSearchPending = false;
    state.learnSearchResults = Array.isArray(payload.results) ? payload.results : [];
    state.learnSearchStatus =
      state.learnSearchResults.length > 0 ? `Found ${state.learnSearchResults.length} images` : "No images found";
    syncLearnSearchModal();
  } catch (error) {
    if (state.learnSearchRequestId !== requestId) {
      return;
    }

    console.error(error);
    state.learnSearchPending = false;
    state.learnSearchResults = [];
    state.learnSearchStatus = getLearnSearchErrorMessage(error);
    syncLearnSearchModal();
  }
}

async function importSelectedSearchImage(resultId) {
  const result = state.learnSearchResults.find((item) => item.id === resultId);

  if (!result) {
    return;
  }

  const currentWord = words[state.learnIndex];
  state.learnSearchImportingId = result.id;
  state.learnSearchStatus = "导入中...";
  syncLearnSearchModal();

  try {
    const payload = await importBingSearchImageApi(currentWord.id, result);
    state.dataSource = "api";
    updateWordInDeck(payload.word);
    state.learnImageIndex = Math.max(getWordImages(words[state.learnIndex]).length - 1, 0);
    state.learnSearchImportingId = null;
    closeLearnSearchModal();
    renderLearn();
    renderReview();
    renderImage();
  } catch (error) {
    console.error(error);
    state.learnSearchImportingId = null;
    state.learnSearchStatus = getLearnSearchErrorMessage(error);
    syncLearnSearchModal();
  }
}

function getLearnSearchErrorMessage(error) {
  handlePossibleAuthError(error);

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Search failed. Make sure the backend is running.";
}

function openLearnUploadModal() {
  if (!requireSignedInForAction("\u8bf7\u5148\u767b\u5f55\uff0c\u7136\u540e\u518d\u4e0a\u4f20\u56fe\u7247\u3002")) {
    return;
  }

  if (!hasDeckWords()) {
    return;
  }

  if (state.learnSearchOpen) {
    closeLearnSearchModal();
  }

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
  handlePossibleAuthError(error);

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "上传失败，请确认后端已经启动";
}

async function deleteCurrentLearnImage() {
  if (!requireSignedInForAction("\u8bf7\u5148\u767b\u5f55\uff0c\u7136\u540e\u518d\u5220\u9664\u56fe\u7247\u3002")) {
    setLearnDeleteMenu(false);
    return;
  }

  if (!hasDeckWords()) {
    setLearnDeleteMenu(false);
    return;
  }

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
    const rawValue = readStorageValue(STORAGE_KEYS.imageRemovals, [LEGACY_STORAGE_KEYS.imageRemovals]);

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
    writeStorageValue(
      STORAGE_KEYS.imageRemovals,
      JSON.stringify(state.removedImagesByWord),
      [LEGACY_STORAGE_KEYS.imageRemovals]
    );
  } catch (error) {
    return;
  }
}

function loadCachedApiDeck() {
  try {
    const rawValue = readStorageValue(STORAGE_KEYS.apiDeckCache, [LEGACY_STORAGE_KEYS.apiDeckCache]);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue);

    if (Array.isArray(parsedValue)) {
      return {
        ownerKey: null,
        books: [],
        activeBookCode: "",
        words: parsedValue
      };
    }

    if (parsedValue && typeof parsedValue === "object" && Array.isArray(parsedValue.words)) {
      return {
        ...parsedValue,
        ownerKey:
          typeof parsedValue.ownerKey === "string" && parsedValue.ownerKey
            ? parsedValue.ownerKey
            : parsedValue.ownerEmail
              ? `email:${String(parsedValue.ownerEmail).trim().toLowerCase()}`
              : null
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

function persistApiDeckCache(deckPayload) {
  try {
    writeStorageValue(
      STORAGE_KEYS.apiDeckCache,
      JSON.stringify(deckPayload),
      [LEGACY_STORAGE_KEYS.apiDeckCache]
    );
  } catch (error) {
    return;
  }
}

function loadAuthToken() {
  try {
    return (
      readStorageValue(STORAGE_KEYS.authSessionToken, [LEGACY_STORAGE_KEYS.authSessionToken]) || null
    );
  } catch (error) {
    return null;
  }
}

function loadStoredAuthUser() {
  try {
    const rawValue = readStorageValue(STORAGE_KEYS.authUser, [LEGACY_STORAGE_KEYS.authUser]);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue);
    return parsedValue && typeof parsedValue === "object" ? parsedValue : null;
  } catch (error) {
    return null;
  }
}

function persistAuthSession(token, user) {
  try {
    writeStorageValue(STORAGE_KEYS.authSessionToken, token, [LEGACY_STORAGE_KEYS.authSessionToken]);
    writeStorageValue(STORAGE_KEYS.authUser, JSON.stringify(user), [LEGACY_STORAGE_KEYS.authUser]);
  } catch (error) {
    return;
  }
}

function buildAuthCacheOwnerKey(user) {
  if (!user || typeof user !== "object") {
    return "";
  }

  if (typeof user.username === "string" && user.username.trim()) {
    return `username:${user.username.trim()}`;
  }

  if (typeof user.email === "string" && user.email.trim()) {
    return `email:${user.email.trim().toLowerCase()}`;
  }

  if ("id" in user && user.id != null) {
    return `id:${String(user.id)}`;
  }

  return "";
}

function getAuthUserDisplayName(user) {
  if (!user || typeof user !== "object") {
    return "";
  }

  return user.displayName || user.username || user.email || "";
}

function getAuthUserAccountMeta(user) {
  if (!user || typeof user !== "object") {
    return "";
  }

  if (user.authProvider === "username" || user.username) {
    return `名字账号：${user.username || user.displayName || ""}`;
  }

  return user.email || "";
}

function clearStoredAuthSession() {
  try {
    removeStorageValue(STORAGE_KEYS.authSessionToken, [LEGACY_STORAGE_KEYS.authSessionToken]);
    removeStorageValue(STORAGE_KEYS.authUser, [LEGACY_STORAGE_KEYS.authUser]);
  } catch (error) {
    return;
  }
}

function readStorageValue(primaryKey, legacyKeys = []) {
  const storageKeys = [primaryKey, ...legacyKeys];

  for (const storageKey of storageKeys) {
    const rawValue = window.localStorage.getItem(storageKey);

    if (rawValue !== null) {
      return rawValue;
    }
  }

  return null;
}

function writeStorageValue(primaryKey, rawValue, legacyKeys = []) {
  window.localStorage.setItem(primaryKey, rawValue);

  legacyKeys.forEach((legacyKey) => {
    if (legacyKey !== primaryKey) {
      window.localStorage.removeItem(legacyKey);
    }
  });
}

function removeStorageValue(primaryKey, legacyKeys = []) {
  [primaryKey, ...legacyKeys].forEach((storageKey) => {
    window.localStorage.removeItem(storageKey);
  });
}

function cloneWords(sourceWords) {
  return sourceWords.map((word) => ({
    ...word,
    images: Array.isArray(word.images) ? word.images.map((image) => ({ ...image })) : []
  }));
}

function resolveApiBaseUrl() {
  const explicitBaseUrl = readOptionalGlobalString("TUGE_DANCI_API_BASE", ["WORD_IMAGE_MEMO_API_BASE"]);

  if (explicitBaseUrl) {
    return explicitBaseUrl.replace(/\/$/, "");
  }

  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  const hostname = window.location.hostname || "localhost";
  return `${protocol}//${hostname}:3000/api`;
}

function resolveApiOrigin(apiBaseUrl) {
  try {
    return new URL(apiBaseUrl).origin;
  } catch (error) {
    return "";
  }
}

function readOptionalGlobalString(primaryKey, legacyKeys = []) {
  const globalKeys = [primaryKey, ...legacyKeys];

  for (const globalKey of globalKeys) {
    const rawValue = typeof window[globalKey] === "string" ? window[globalKey].trim() : "";

    if (rawValue) {
      return rawValue;
    }
  }

  return "";
}

function resolveRuntimeUrl(rawUrl) {
  if (!rawUrl) {
    return "";
  }

  try {
    if (rawUrl.startsWith("/")) {
      return API_ORIGIN ? new URL(rawUrl, API_ORIGIN).toString() : rawUrl;
    }

    const runtimeUrl = new URL(rawUrl);
    const runtimeHostName = window.location.hostname || "localhost";

    if (LOCALHOST_HOSTNAMES.has(runtimeUrl.hostname) && !LOCALHOST_HOSTNAMES.has(runtimeHostName)) {
      runtimeUrl.hostname = runtimeHostName;
    }

    return runtimeUrl.toString();
  } catch (error) {
    return rawUrl;
  }
}

function normalizeWord(word) {
  const normalizedImages = (Array.isArray(word.images) ? word.images : []).map((image, index) => ({
    id: typeof image.id === "number" ? image.id : image.id || `${word.id}-${index + 1}`,
    url: resolveRuntimeUrl(image.url || image.publicUrl || ""),
    source: image.source || image.sourceLabel || word.imageSource || "Image",
    credit: image.credit ?? image.sourceCredit ?? word.imageCredit ?? null,
    storageType: image.storageType || "external",
    storageKey: image.storageKey || null,
    sortOrder: image.sortOrder ?? index
  }));

  return {
    ...word,
    image: resolveRuntimeUrl(word.image || normalizedImages[0]?.url || ""),
    imageSource: word.imageSource || normalizedImages[0]?.source || null,
    imageCredit: word.imageCredit || normalizedImages[0]?.credit || null,
    images: normalizedImages
  };
}

async function fetchLearningDeck(bookCode = "") {
  const searchParams = new URLSearchParams();

  if (bookCode) {
    searchParams.set("book", bookCode);
  }

  const requestUrl = `${API_BASE_URL}/learning-deck${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const response = await fetch(requestUrl, {
    headers: buildApiHeaders({
      Accept: "application/json"
    })
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, "Failed to load learning deck"));
  }

  return response.json();
}

async function fetchCommunityFeedApi() {
  const response = await fetch(`${API_BASE_URL}/community/feed`, {
    headers: buildApiHeaders({
      Accept: "application/json"
    })
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, "加载社区失败"));
  }

  return response.json();
}

async function fetchCommunityPostDetailApi(postId) {
  const response = await fetch(`${API_BASE_URL}/community/posts/${postId}`, {
    headers: buildApiHeaders({
      Accept: "application/json"
    })
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, "加载帖子详情失败"));
  }

  return response.json();
}

async function publishCommunityPostApi(payload) {
  const response = await fetch(`${API_BASE_URL}/community/posts`, {
    method: "POST",
    headers: buildApiHeaders({
      Accept: "application/json",
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, "发布到社区失败"));
  }

  return response.json();
}

async function createCommunityCommentApi(postId, payload) {
  const response = await fetch(`${API_BASE_URL}/community/posts/${postId}/comments`, {
    method: "POST",
    headers: buildApiHeaders({
      Accept: "application/json",
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, "评论失败"));
  }

  return response.json();
}

async function toggleCommunityPostLikeApi(postId) {
  const response = await fetch(`${API_BASE_URL}/community/posts/${postId}/toggle-like`, {
    method: "POST",
    headers: buildApiHeaders({
      Accept: "application/json"
    })
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, "点赞失败"));
  }

  return response.json();
}

async function favoriteCommunityPostApi(postId) {
  const response = await fetch(`${API_BASE_URL}/community/posts/${postId}/favorite`, {
    method: "POST",
    headers: buildApiHeaders({
      Accept: "application/json"
    })
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, "收藏失败"));
  }

  return response.json();
}

async function toggleCommunityCommentLikeApi(commentId) {
  const response = await fetch(`${API_BASE_URL}/community/comments/${commentId}/toggle-like`, {
    method: "POST",
    headers: buildApiHeaders({
      Accept: "application/json"
    })
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, "评论点赞失败"));
  }

  return response.json();
}

async function deleteWordImageApi(imageId) {
  const response = await fetch(`${API_BASE_URL}/word-images/${imageId}/delete`, {
    method: "PATCH",
    headers: buildApiHeaders({
      Accept: "application/json"
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to delete image: ${response.status}`);
  }

  return response.json();
}

async function searchBingImagesApi(query) {
  const searchParams = new URLSearchParams({
    q: query
  });
  const response = await fetch(`${API_BASE_URL}/word-images/search/bing?${searchParams.toString()}`, {
    headers: buildApiHeaders({
      Accept: "application/json"
    })
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, "图片搜索失败"));
  }

  return response.json();
}

async function importBingSearchImageApi(wordId, result) {
  const response = await fetch(`${API_BASE_URL}/word-images/search/import/${encodeURIComponent(wordId)}`, {
    method: "POST",
    headers: buildApiHeaders({
      Accept: "application/json",
      "Content-Type": "application/json"
    }),
    body: JSON.stringify({
      mediaUrl: result.mediaUrl,
      thumbnailUrl: result.thumbnailUrl,
      sourcePageUrl: result.sourcePageUrl,
      title: result.title
    })
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, "图片导入失败"));
  }

  return response.json();
}

async function uploadWordImageApi(wordId, file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE_URL}/word-images/upload/${encodeURIComponent(wordId)}`, {
    method: "POST",
    headers: buildApiHeaders(),
    body: formData
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, "图片上传失败"));
  }

  return response.json();
}

async function loginWithEmailApi(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, "登录失败"));
  }

  return response.json();
}

async function sendRegisterCodeApi(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/register/send-code`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, "发送验证码失败"));
  }

  return response.json();
}

async function registerWithEmailApi(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, "注册失败"));
  }

  return response.json();
}

async function loginWithUsernameApi(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/login/username`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, "登录失败"));
  }

  return response.json();
}

async function registerWithUsernameApi(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/register/username`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, "注册失败"));
  }

  return response.json();
}

async function fetchCurrentUserApi() {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: buildApiHeaders({
      Accept: "application/json"
    })
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, "获取登录状态失败"));
  }

  return response.json();
}

async function logoutApi() {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: buildApiHeaders({
      Accept: "application/json"
    })
  });

  if (!response.ok) {
    throw new Error(await extractApiErrorMessage(response, "退出失败"));
  }

  return response.json();
}



function buildApiHeaders(headers = {}) {
  const nextHeaders = { ...headers };

  if (state.authToken) {
    nextHeaders.Authorization = `Bearer ${state.authToken}`;
  }

  return nextHeaders;
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
    persistApiDeckCache({
      ownerKey: buildAuthCacheOwnerKey(state.authUser),
      books: state.books,
      activeBookCode: state.activeBookCode,
      words
    });
  }
}

function buildEmptyImagePlaceholder(word) {
  const title = encodeURIComponent(word?.english ? `${word.english} has no image` : "No image yet");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 720">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#eff8ff" />
        <stop offset="100%" stop-color="#d9ecfb" />
      </linearGradient>
    </defs>
    <rect width="960" height="720" rx="48" fill="url(#bg)" />
    <circle cx="300" cy="250" r="88" fill="#9bd2ee" opacity="0.7" />
    <path d="M180 520 360 350l120 116 92-90 208 144v80H180Z" fill="#7fb9da" opacity="0.85" />
    <text x="480" y="612" text-anchor="middle" font-family="Avenir Next, Segoe UI, sans-serif" font-size="42" fill="#31506b">No image yet</text>
  </svg>`;

  return {
    id: `${word?.id || "word"}-empty`,
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    source: "Placeholder",
    credit: null,
    storageType: "placeholder",
    storageKey: null,
    sortOrder: 0,
    alt: title
  };
}

function hasDeckWords() {
  return Array.isArray(words) && words.length > 0;
}

function getErrorMessage(error, fallbackMessage) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

function handlePossibleAuthError(error) {
  const message = error instanceof Error ? error.message : "";

  if (!message) {
    return false;
  }

  if (
    /please sign in first|please sign in again|session is invalid|session has expired|\u8bf7\u5148\u767b\u5f55|\u91cd\u65b0\u767b\u5f55|\u4f1a\u8bdd.*(?:\u8fc7\u671f|\u5931\u6548)/i.test(
      message
    )
  ) {
    clearAuthSessionState();
    openAuthView(message, "error");
    return true;
  }

  return false;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "\"":
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });
}
