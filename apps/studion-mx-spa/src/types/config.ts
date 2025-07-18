export interface Config {
    linkedDomains: string[];
    env: {
        API_URL: string;
        FACEBADGE_URL: string;
        OAUTH_REDIRECT_URI: string;
        APP_KEY: string;
        APP_SECRET: string;
        THEME_NAME: string;
        DEFAULT_ACCESSIBILITY: boolean;
        DEFAULT_LANGUAGE: string;
        DEFAULT_CURRENCY: string;
        DEFAULT_CURRENCY_SEPARATOR: string;
        DEFAULT_CLASSROOM_MENU: string;
        HIDDEN_MENU_ITEMS: string;
        HIDDEN_TOOLS: string[];
        HIDDEN_FEATURES: string[];
        USER_INFO_READONLY: boolean;
        WHITE_LABEL: boolean;
        GAMIFICATION_ENABLE: boolean;
        GA4_TOKEN: string[];
        GTM_TOKEN: string[];
        REDIRECT_URL: string;
        APP_TITLE: string;
        CARDS_BANNERS: boolean;
        BLOCK_META_OPT_IN: boolean;
        ENABLE_SURVEY: boolean;
        APP_DESCRIPTION: string;
        API_URL_BASE_MOCK: string;
        URL_MOCKS: string[];
        SHOW_DASHBOARDS_HIGHLIGHT: boolean;
        HOTJAR_ID: string;
        KEYCLOAK_ENABLED: boolean;
        KEYCLOAK_HOST: string;
        KEYCLOAK_REALM: string;
        KEYCLOAK_CLIENT_ID: string;
        FIRST_SURVEY: number;
        SURVEY_PERIOD: number;
        CAROUSEL_AUTOPLAY_TIMER: number;
        STATE_STORAGE: string;
        LARGE_FILES_MAX_SIZE: number;
        SMALL_FILES_MAX_SIZE: number;
        ZENDESK_KEY_STUDENT: string;
        USER_WAY_KEY: string;
        USER_WAY_KEY_SCORM: string;
        ZENDESK_KEY_ADMIN: string;
        CUSTOM_PASSWORD_REQUIREMENTS: {
            ENABLED: boolean;
            SIZE: number;
            LOWER_CASE: boolean;
            UPPER_CASE: boolean;
            SPECIAL_CHAR: boolean;
            NUMBER: boolean;
        };
        NEW_FOOTER: boolean;
        VERTICAL_MENU_V2: boolean;
        CUSTOM_CLASSROOM_REDIRECT: string;
        ENABLE_CLASSROOM_TRAIL_REDIRECT: boolean;
        HIDE_STUDENT_CONFERENCE_RECORD: boolean;
        HIDE_CONFERENCE_RECORD: boolean;
        PORTAL_CONFIGS: {
            MAIN_URL: string;
            COURSES_URL: string;
            TRAIL_COURSES_URL: string;
            PROFILE_URL: string;
            LOGOUT_URL: string;
        };
        SIGE_CONFIGS: {
            MAIN_URL: string;
        };
        SEND_PORTAL_REDIRECT_TRAIL_ID: boolean;
        OPEN_CLASSROOM_LESSONS_ON_FULLSCREEN: boolean;
        EMAIL_ATTACHMENT_LIMIT_SIZE_MB: number;
        REMOVE_DATA_TESTID: boolean;
        HIDE_CERTIFICATE_DOWNLOAD: boolean;
        ENABLE_RESEARCH_WARNING: boolean;
        CERTIFICATE_ORGANIZATION: string;
        SHOW_THUMB_ON_LAST_TOPIC_WHEN_END_VIDEO: boolean;
        PLUTON_API: string;
        HIDE_VIEW_WORKLOAD: boolean;
        HIDE_VIEW_DURATION: boolean;
        HIDE_VIEW_BANNERS_CONTAINER: boolean;
        CAN_READ_WHEN_UPPER_FLAG: boolean;
        MINUTES_TILL_LOGOUT: number;
        APP_CHAT_BOT_MENTORING: string;
        APP_CHAT_BOT_STUDION: string;
        APP_CHAT_BOT_DOT_AI_STUDION: string;
        APP_CHAT_BOT_DOT_AI_MENTORING: string;
        FORCE_METADATA_FILL: boolean;
        AVOID_EXTERNAL: boolean;
        WEB_VIEWER_PDF_LICENSE_KEY: string;
        POWER_BI_EXTERNAL_LINK: boolean;
        PDF_CONSUME_RULE: number;
    };
}