// 国际化模块
// 支持中文、英文、俄语、日语、韩语

const i18n = {
  // 当前语言
  currentLang: 'zh',
  
  // 翻译字典
  translations: {
    zh: {
      // 应用标题
      appTitle: 'Mole Desktop',
      
      // 侧边栏分组
      groupSystem: '系统工具',
      groupMaintenance: '维护管理',
      groupSettings: '设置',
      
      // 功能名称
      clean: '系统清理',
      uninstall: '应用卸载',
      analyze: '磁盘分析',
      status: '系统状态',
      optimize: '系统优化',
      history: '操作历史',
      purge: '项目清理',
      installer: '安装包清理',
      touchid: 'Touch ID',
      update: '应用更新',
      remove: '应用移除',
      completion: 'Shell 补全',
      envs: '环境变量',
      settings: '设置',
      
      // 功能描述
      cleanDesc: '清理缓存、日志和临时文件',
      uninstallDesc: '卸载应用及其残留文件',
      analyzeDesc: '可视化磁盘使用情况',
      statusDesc: '实时系统健康监控',
      optimizeDesc: '刷新缓存和系统服务',
      historyDesc: '查看历史操作记录',
      purgeDesc: '清理项目构建产物',
      installerDesc: '查找并移除安装包文件',
      touchidDesc: '配置 Touch ID 用于 sudo',
      updateDesc: '更新 Mole 到最新版本',
      removeDesc: '从系统中移除 Mole',
      completionDesc: '设置 Shell 自动补全',
      envsDesc: '管理系统环境变量',
      settingsDesc: '应用设置和偏好',
      
      // 通用按钮
      scan: '扫描',
      clean: '立即清理',
      refresh: '刷新',
      add: '添加',
      edit: '编辑',
      delete: '删除',
      save: '保存',
      cancel: '取消',
      confirm: '确认',
      close: '关闭',
      loading: '加载中...',
      scanning: '扫描中...',
      
      // 设置页面
      settingsTitle: '设置',
      language: '语言',
      languageDesc: '选择应用显示语言',
      theme: '主题',
      themeDesc: '选择应用主题',
      themeLight: '浅色',
      themeDark: '深色',
      themeAuto: '跟随系统',
      
      // 状态文本
      engineReady: '引擎就绪',
      toggleTheme: '切换主题',
      
      // 系统清理
      cleanableItems: '可清理项目',
      freeableSpace: '可释放空间',
      categories: '分类数',
      whitelist: '白名单',
      
      // 应用卸载
      scanApps: '扫描应用',
      
      // 磁盘分析
      startAnalyze: '开始分析',
      
      // 系统状态
      refreshStatus: '刷新状态',
      
      // 系统优化
      scanOptimize: '扫描优化项',
      runOptimize: '执行优化',
      stop: '停止',
      
      // 操作历史
      refreshHistory: '刷新历史',
      jsonFormat: 'JSON 格式',
      
      // 项目清理
      scanProjects: '扫描项目',
      previewClean: '预览清理',
      cleanProjects: '清理项目',
      scanDirs: '扫描目录',
      
      // 安装包清理
      scanInstallers: '扫描安装包',
      cleanInstallers: '清理安装包',
      
      // Touch ID
      configTouchid: '配置 Touch ID',
      enableTouchid: '启用 Touch ID',
      
      // 应用更新
      checkUpdate: '检查更新',
      
      // 应用移除
      removeApp: '移除应用',
      
      // Shell 补全
      setupCompletion: '设置补全',
      
      // 环境变量
      refreshList: '刷新列表',
      addEnv: '新增变量',
      searchEnv: '搜索变量...',
      envName: '变量名',
      envValue: '变量值',
      envSource: '来源',
      noEnvs: '无环境变量',
      envPlaceholder: '点击「刷新列表」查看环境变量',
      envHint: '查看、新增、编辑和删除环境变量',
      
      // 状态消息
      scanComplete: '扫描完成',
      cleanComplete: '清理完成',
      operationComplete: '操作完成',
      operationFailed: '操作失败',
      
      // 确认对话框
      confirmClean: '确认要清理这些项目吗？',
      confirmUninstall: '确认要卸载此应用吗？',
      confirmDelete: '确认要删除吗？',
      
      // 提示消息
      inputVarName: '请输入变量名:',
      inputVarValue: '请输入变量值:',
      selectConfigFile: '选择配置文件 (.zshrc / .bash_profile / .bashrc):',
      added: '已添加',
      deleted: '已删除',
      addFailed: '添加失败',
      deleteFailed: '删除失败',
    },
    
    en: {
      // App title
      appTitle: 'Mole Desktop',
      
      // Sidebar groups
      groupSystem: 'System Tools',
      groupMaintenance: 'Maintenance',
      groupSettings: 'Settings',
      
      // Feature names
      clean: 'System Clean',
      uninstall: 'App Uninstall',
      analyze: 'Disk Analysis',
      status: 'System Status',
      optimize: 'System Optimize',
      history: 'Operation History',
      purge: 'Project Clean',
      installer: 'Installer Clean',
      touchid: 'Touch ID',
      update: 'App Update',
      remove: 'App Remove',
      completion: 'Shell Completion',
      envs: 'Environment Variables',
      settings: 'Settings',
      
      // Feature descriptions
      cleanDesc: 'Clean cache, logs and temp files',
      uninstallDesc: 'Uninstall apps and residual files',
      analyzeDesc: 'Visualize disk usage',
      statusDesc: 'Real-time system health monitor',
      optimizeDesc: 'Refresh cache and system services',
      historyDesc: 'View operation history',
      purgeDesc: 'Clean project build artifacts',
      installerDesc: 'Find and remove installer files',
      touchidDesc: 'Configure Touch ID for sudo',
      updateDesc: 'Update Mole to latest version',
      removeDesc: 'Remove Mole from system',
      completionDesc: 'Setup shell auto-completion',
      envsDesc: 'Manage system environment variables',
      settingsDesc: 'App settings and preferences',
      
      // Common buttons
      scan: 'Scan',
      clean: 'Clean Now',
      refresh: 'Refresh',
      add: 'Add',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      close: 'Close',
      loading: 'Loading...',
      scanning: 'Scanning...',
      
      // Settings page
      settingsTitle: 'Settings',
      language: 'Language',
      languageDesc: 'Select display language',
      theme: 'Theme',
      themeDesc: 'Select app theme',
      themeLight: 'Light',
      themeDark: 'Dark',
      themeAuto: 'System',
      
      // Status text
      engineReady: 'Engine Ready',
      toggleTheme: 'Toggle Theme',
      
      // System clean
      cleanableItems: 'Cleanable Items',
      freeableSpace: 'Freeable Space',
      categories: 'Categories',
      whitelist: 'Whitelist',
      
      // App uninstall
      scanApps: 'Scan Apps',
      
      // Disk analysis
      startAnalyze: 'Start Analysis',
      
      // System status
      refreshStatus: 'Refresh Status',
      
      // System optimize
      scanOptimize: 'Scan Items',
      runOptimize: 'Run Optimize',
      stop: 'Stop',
      
      // Operation history
      refreshHistory: 'Refresh History',
      jsonFormat: 'JSON Format',
      
      // Project clean
      scanProjects: 'Scan Projects',
      previewClean: 'Preview Clean',
      cleanProjects: 'Clean Projects',
      scanDirs: 'Scan Dirs',
      
      // Installer clean
      scanInstallers: 'Scan Installers',
      cleanInstallers: 'Clean Installers',
      
      // Touch ID
      configTouchid: 'Configure Touch ID',
      enableTouchid: 'Enable Touch ID',
      
      // App update
      checkUpdate: 'Check Update',
      
      // App remove
      removeApp: 'Remove App',
      
      // Shell completion
      setupCompletion: 'Setup Completion',
      
      // Environment variables
      refreshList: 'Refresh List',
      addEnv: 'Add Variable',
      searchEnv: 'Search variables...',
      envName: 'Name',
      envValue: 'Value',
      envSource: 'Source',
      noEnvs: 'No environment variables',
      envPlaceholder: 'Click "Refresh List" to view variables',
      envHint: 'View, add, edit and delete variables',
      
      // Status messages
      scanComplete: 'Scan Complete',
      cleanComplete: 'Clean Complete',
      operationComplete: 'Operation Complete',
      operationFailed: 'Operation Failed',
      
      // Confirm dialogs
      confirmClean: 'Are you sure to clean these items?',
      confirmUninstall: 'Are you sure to uninstall this app?',
      confirmDelete: 'Are you sure to delete?',
      
      // Prompt messages
      inputVarName: 'Enter variable name:',
      inputVarValue: 'Enter variable value:',
      selectConfigFile: 'Select config file (.zshrc / .bash_profile / .bashrc):',
      added: 'Added',
      deleted: 'Deleted',
      addFailed: 'Add failed',
      deleteFailed: 'Delete failed',
    },
    
    ru: {
      // Заголовок приложения
      appTitle: 'Mole Desktop',
      
      // Группы боковой панели
      groupSystem: 'Системные инструменты',
      groupMaintenance: 'Обслуживание',
      groupSettings: 'Настройки',
      
      // Названия функций
      clean: 'Очистка системы',
      uninstall: 'Удаление приложений',
      analyze: 'Анализ диска',
      status: 'Состояние системы',
      optimize: 'Оптимизация',
      history: 'История операций',
      purge: 'Очистка проектов',
      installer: 'Очистка установщиков',
      touchid: 'Touch ID',
      update: 'Обновление',
      remove: 'Удаление приложения',
      completion: 'Автодополнение Shell',
      envs: 'Переменные среды',
      settings: 'Настройки',
      
      // Описания функций
      cleanDesc: 'Очистка кэша, логов и временных файлов',
      uninstallDesc: 'Удаление приложений и остаточных файлов',
      analyzeDesc: 'Визуализация использования диска',
      statusDesc: 'Мониторинг состояния системы',
      optimizeDesc: 'Обновление кэша и системных служб',
      historyDesc: 'Просмотр истории операций',
      purgeDesc: 'Очистка артефактов сборки проектов',
      installerDesc: 'Поиск и удаление установочных файлов',
      touchidDesc: 'Настройка Touch ID для sudo',
      updateDesc: 'Обновление Mole до последней версии',
      removeDesc: 'Удаление Mole из системы',
      completionDesc: 'Настройка автодополнения shell',
      envsDesc: 'Управление переменными среды',
      settingsDesc: 'Настройки приложения',
      
      // Общие кнопки
      scan: 'Сканировать',
      clean: 'Очистить',
      refresh: 'Обновить',
      add: 'Добавить',
      edit: 'Изменить',
      delete: 'Удалить',
      save: 'Сохранить',
      cancel: 'Отмена',
      confirm: 'Подтвердить',
      close: 'Закрыть',
      loading: 'Загрузка...',
      scanning: 'Сканирование...',
      
      // Страница настроек
      settingsTitle: 'Настройки',
      language: 'Язык',
      languageDesc: 'Выберите язык интерфейса',
      theme: 'Тема',
      themeDesc: 'Выберите тему приложения',
      themeLight: 'Светлая',
      themeDark: 'Тёмная',
      themeAuto: 'Системная',
      
      // Текст состояния
      engineReady: 'Движок готов',
      toggleTheme: 'Переключить тему',
      
      // Очистка системы
      cleanableItems: 'Элементы для очистки',
      freeableSpace: 'Освободить место',
      categories: 'Категории',
      whitelist: 'Белый список',
      
      // Удаление приложений
      scanApps: 'Сканировать приложения',
      
      // Анализ диска
      startAnalyze: 'Начать анализ',
      
      // Состояние системы
      refreshStatus: 'Обновить состояние',
      
      // Оптимизация
      scanOptimize: 'Сканировать',
      runOptimize: 'Выполнить',
      stop: 'Стоп',
      
      // История операций
      refreshHistory: 'Обновить историю',
      jsonFormat: 'Формат JSON',
      
      // Очистка проектов
      scanProjects: 'Сканировать проекты',
      previewClean: 'Предпросмотр',
      cleanProjects: 'Очистить проекты',
      scanDirs: 'Сканировать папки',
      
      // Очистка установщиков
      scanInstallers: 'Сканировать установщики',
      cleanInstallers: 'Очистить установщики',
      
      // Touch ID
      configTouchid: 'Настроить Touch ID',
      enableTouchid: 'Включить Touch ID',
      
      // Обновление
      checkUpdate: 'Проверить обновления',
      
      // Удаление приложения
      removeApp: 'Удалить приложение',
      
      // Автодополнение Shell
      setupCompletion: 'Настроить автодополнение',
      
      // Переменные среды
      refreshList: 'Обновить список',
      addEnv: 'Добавить переменную',
      searchEnv: 'Поиск переменных...',
      envName: 'Имя',
      envValue: 'Значение',
      envSource: 'Источник',
      noEnvs: 'Нет переменных среды',
      envPlaceholder: 'Нажмите «Обновить список» для просмотра',
      envHint: 'Просмотр, добавление, изменение и удаление переменных',
      
      // Сообщения состояния
      scanComplete: 'Сканирование завершено',
      cleanComplete: 'Очистка завершена',
      operationComplete: 'Операция завершена',
      operationFailed: 'Ошибка операции',
      
      // Диалоги подтверждения
      confirmClean: 'Вы уверены, что хотите очистить эти элементы?',
      confirmUninstall: 'Вы уверены, что хотите удалить это приложение?',
      confirmDelete: 'Вы уверены, что хотите удалить?',
      
      // Сообщения подсказок
      inputVarName: 'Введите имя переменной:',
      inputVarValue: 'Введите значение переменной:',
      selectConfigFile: 'Выберите файл конфигурации (.zshrc / .bash_profile / .bashrc):',
      added: 'Добавлено',
      deleted: 'Удалено',
      addFailed: 'Ошибка добавления',
      deleteFailed: 'Ошибка удаления',
    },
    
    ja: {
      // アプリタイトル
      appTitle: 'Mole Desktop',
      
      // サイドバーグループ
      groupSystem: 'システムツール',
      groupMaintenance: 'メンテナンス',
      groupSettings: '設定',
      
      // 機能名
      clean: 'システムクリーン',
      uninstall: 'アプリアンインストール',
      analyze: 'ディスク分析',
      status: 'システム状態',
      optimize: 'システム最適化',
      history: '操作履歴',
      purge: 'プロジェクトクリーン',
      installer: 'インストーラークリーン',
      touchid: 'Touch ID',
      update: 'アプリ更新',
      remove: 'アプリ削除',
      completion: 'Shell 補完',
      envs: '環境変数',
      settings: '設定',
      
      // 機能説明
      cleanDesc: 'キャッシュ、ログ、一時ファイルをクリーン',
      uninstallDesc: 'アプリと残存ファイルをアンインストール',
      analyzeDesc: 'ディスク使用状況を可視化',
      statusDesc: 'リアルタイムシステムヘルスモニター',
      optimizeDesc: 'キャッシュとシステムサービスをリフレッシュ',
      historyDesc: '操作履歴を表示',
      purgeDesc: 'プロジェクトビルド成果物をクリーン',
      installerDesc: 'インストーラーファイルを検索・削除',
      touchidDesc: 'sudo 用の Touch ID を設定',
      updateDesc: 'Mole を最新バージョンに更新',
      removeDesc: 'システムから Mole を削除',
      completionDesc: 'シェル自動補完を設定',
      envsDesc: 'システム環境変数を管理',
      settingsDesc: 'アプリ設定と環境設定',
      
      // 共通ボタン
      scan: 'スキャン',
      clean: '今すぐクリーン',
      refresh: '更新',
      add: '追加',
      edit: '編集',
      delete: '削除',
      save: '保存',
      cancel: 'キャンセル',
      confirm: '確認',
      close: '閉じる',
      loading: '読み込み中...',
      scanning: 'スキャン中...',
      
      // 設定ページ
      settingsTitle: '設定',
      language: '言語',
      languageDesc: '表示言語を選択',
      theme: 'テーマ',
      themeDesc: 'アプリテーマを選択',
      themeLight: 'ライト',
      themeDark: 'ダーク',
      themeAuto: 'システム',
      
      // ステータステキスト
      engineReady: 'エンジン準備完了',
      toggleTheme: 'テーマ切替',
      
      // システムクリーン
      cleanableItems: 'クリーン可能項目',
      freeableSpace: '解放可能スペース',
      categories: 'カテゴリ',
      whitelist: 'ホワイトリスト',
      
      // アプリアンインストール
      scanApps: 'アプリをスキャン',
      
      // ディスク分析
      startAnalyze: '分析開始',
      
      // システム状態
      refreshStatus: '状態を更新',
      
      // システム最適化
      scanOptimize: '項目をスキャン',
      runOptimize: '最適化実行',
      stop: '停止',
      
      // 操作履歴
      refreshHistory: '履歴を更新',
      jsonFormat: 'JSON 形式',
      
      // プロジェクトクリーン
      scanProjects: 'プロジェクトをスキャン',
      previewClean: 'プレビュー',
      cleanProjects: 'プロジェクトをクリーン',
      scanDirs: 'ディレクトリをスキャン',
      
      // インストーラークリーン
      scanInstallers: 'インストーラーをスキャン',
      cleanInstallers: 'インストーラーをクリーン',
      
      // Touch ID
      configTouchid: 'Touch ID を設定',
      enableTouchid: 'Touch ID を有効化',
      
      // アプリ更新
      checkUpdate: '更新を確認',
      
      // アプリ削除
      removeApp: 'アプリを削除',
      
      // Shell 補完
      setupCompletion: '補完を設定',
      
      // 環境変数
      refreshList: 'リストを更新',
      addEnv: '変数を追加',
      searchEnv: '変数を検索...',
      envName: '名前',
      envValue: '値',
      envSource: 'ソース',
      noEnvs: '環境変数なし',
      envPlaceholder: '「リストを更新」をクリックして変数を表示',
      envHint: '変数の表示、追加、編集、削除',
      
      // ステータスメッセージ
      scanComplete: 'スキャン完了',
      cleanComplete: 'クリーン完了',
      operationComplete: '操作完了',
      operationFailed: '操作失敗',
      
      // 確認ダイアログ
      confirmClean: 'これらの項目をクリーンしますか？',
      confirmUninstall: 'このアプリをアンインストールしますか？',
      confirmDelete: '削除しますか？',
      
      // プロンプトメッセージ
      inputVarName: '変数名を入力:',
      inputVarValue: '変数値を入力:',
      selectConfigFile: '設定ファイルを選択 (.zshrc / .bash_profile / .bashrc):',
      added: '追加しました',
      deleted: '削除しました',
      addFailed: '追加に失敗',
      deleteFailed: '削除に失敗',
    },
    
    ko: {
      // 앱 제목
      appTitle: 'Mole Desktop',
      
      // 사이드바 그룹
      groupSystem: '시스템 도구',
      groupMaintenance: '유지보수',
      groupSettings: '설정',
      
      // 기능 이름
      clean: '시스템 정리',
      uninstall: '앱 제거',
      analyze: '디스크 분석',
      status: '시스템 상태',
      optimize: '시스템 최적화',
      history: '작업 기록',
      purge: '프로젝트 정리',
      installer: '설치 파일 정리',
      touchid: 'Touch ID',
      update: '앱 업데이트',
      remove: '앱 제거',
      completion: 'Shell 자동완성',
      envs: '환경 변수',
      settings: '설정',
      
      // 기능 설명
      cleanDesc: '캐시, 로그 및 임시 파일 정리',
      uninstallDesc: '앱 및 잔여 파일 제거',
      analyzeDesc: '디스크 사용량 시각화',
      statusDesc: '실시간 시스템 상태 모니터링',
      optimizeDesc: '캐시 및 시스템 서비스 새로고침',
      historyDesc: '작업 기록 보기',
      purgeDesc: '프로젝트 빌드 산출물 정리',
      installerDesc: '설치 파일 찾기 및 제거',
      touchidDesc: 'sudo용 Touch ID 구성',
      updateDesc: 'Mole을 최신 버전으로 업데이트',
      removeDesc: '시스템에서 Mole 제거',
      completionDesc: '셸 자동완성 설정',
      envsDesc: '시스템 환경 변수 관리',
      settingsDesc: '앱 설정 및 환경설정',
      
      // 공통 버튼
      scan: '스캔',
      clean: '지금 정리',
      refresh: '새로고침',
      add: '추가',
      edit: '편집',
      delete: '삭제',
      save: '저장',
      cancel: '취소',
      confirm: '확인',
      close: '닫기',
      loading: '로딩 중...',
      scanning: '스캔 중...',
      
      // 설정 페이지
      settingsTitle: '설정',
      language: '언어',
      languageDesc: '표시 언어 선택',
      theme: '테마',
      themeDesc: '앱 테마 선택',
      themeLight: '라이트',
      themeDark: '다크',
      themeAuto: '시스템',
      
      // 상태 텍스트
      engineReady: '엔진 준비됨',
      toggleTheme: '테마 전환',
      
      // 시스템 정리
      cleanableItems: '정리 가능 항목',
      freeableSpace: '해방 가능 공간',
      categories: '카테고리',
      whitelist: '화이트리스트',
      
      // 앱 제거
      scanApps: '앱 스캔',
      
      // 디스크 분석
      startAnalyze: '분석 시작',
      
      // 시스템 상태
      refreshStatus: '상태 새로고침',
      
      // 시스템 최적화
      scanOptimize: '항목 스캔',
      runOptimize: '최적화 실행',
      stop: '중지',
      
      // 작업 기록
      refreshHistory: '기록 새로고침',
      jsonFormat: 'JSON 형식',
      
      // 프로젝트 정리
      scanProjects: '프로젝트 스캔',
      previewClean: '미리보기',
      cleanProjects: '프로젝트 정리',
      scanDirs: '디렉토리 스캔',
      
      // 설치 파일 정리
      scanInstallers: '설치 파일 스캔',
      cleanInstallers: '설치 파일 정리',
      
      // Touch ID
      configTouchid: 'Touch ID 구성',
      enableTouchid: 'Touch ID 활성화',
      
      // 앱 업데이트
      checkUpdate: '업데이트 확인',
      
      // 앱 제거
      removeApp: '앱 제거',
      
      // Shell 자동완성
      setupCompletion: '자동완성 설정',
      
      // 환경 변수
      refreshList: '목록 새로고침',
      addEnv: '변수 추가',
      searchEnv: '변수 검색...',
      envName: '이름',
      envValue: '값',
      envSource: '출처',
      noEnvs: '환경 변수 없음',
      envPlaceholder: '"목록 새로고침"을 클릭하여 변수 보기',
      envHint: '변수 보기, 추가, 편집 및 삭제',
      
      // 상태 메시지
      scanComplete: '스캔 완료',
      cleanComplete: '정리 완료',
      operationComplete: '작업 완료',
      operationFailed: '작업 실패',
      
      // 확인 대화상자
      confirmClean: '이 항목들을 정리하시겠습니까?',
      confirmUninstall: '이 앱을 제거하시겠습니까?',
      confirmDelete: '삭제하시겠습니까?',
      
      // 프롬프트 메시지
      inputVarName: '변수 이름 입력:',
      inputVarValue: '변수 값 입력:',
      selectConfigFile: '설정 파일 선택 (.zshrc / .bash_profile / .bashrc):',
      added: '추가됨',
      deleted: '삭제됨',
      addFailed: '추가 실패',
      deleteFailed: '삭제 실패',
    }
  },
  
  // 获取翻译文本
  t(key) {
    const lang = this.currentLang;
    return this.translations[lang]?.[key] || this.translations.zh[key] || key;
  },
  
  // 设置语言
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('mole-lang', lang);
      this.updateUI();
      return true;
    }
    return false;
  },
  
  // 从 localStorage 加载语言设置
  loadLanguage() {
    const savedLang = localStorage.getItem('mole-lang');
    if (savedLang && this.translations[savedLang]) {
      this.currentLang = savedLang;
    }
  },
  
  // 更新 UI 文本
  updateUI() {
    // 更新所有带 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });
    
    // 更新所有带 data-i18n-placeholder 属性的元素
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });
    
    // 更新所有带 data-i18n-title 属性的元素
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = this.t(key);
    });
    
    // 更新 features 对象中的标题和描述
    this.updateFeatures();
  },
  
  // 更新 features 对象
  updateFeatures() {
    const featureKeys = ['clean', 'uninstall', 'analyze', 'status', 'optimize', 
                         'history', 'purge', 'installer', 'touchid', 'update', 
                         'remove', 'completion', 'envs', 'settings'];
    
    featureKeys.forEach(key => {
      if (window.features && window.features[key]) {
        window.features[key].title = this.t(key);
        window.features[key].subtitle = this.t(key + 'Desc');
      }
    });
  },
  
  // 获取可用语言列表
  getLanguages() {
    return [
      { code: 'zh', name: '中文' },
      { code: 'en', name: 'English' },
      { code: 'ru', name: 'Русский' },
      { code: 'ja', name: '日本語' },
      { code: 'ko', name: '한국어' }
    ];
  }
};

// 导出
window.i18n = i18n;
