import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, shallowMount } from '@vue/test-utils';
import PDFContent from './PDFContent.vue';

// Mocks
vi.mock('@/stores', () => ({
  useConfigStore: () => ({
    getConfig: {
      env: {
        PDF_CONSUME_RULE: 1,
      },
    },
  }),
  useJourneyStore: () => ({
    getCurrentContent: {
      metadata: {
        url: 'http://example.com/file.pdf',
        is_downloadable: true,
        pages: [],
      },
      consumption: {
        uuid: 'consume-uuid',
      },
    },
    getComponents: {
      components: [
        {
          children: [{ uuid: 'child-uuid' }],
        },
      ],
    },
    setConsumeContent: vi.fn().mockResolvedValue(undefined),
    setCurrentContent: vi.fn().mockResolvedValue(undefined),
    setComponents: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: {
      journeyUuid: 'journey-uuid',
      sessionUuid: 'session-uuid',
    },
    query: {
      currentContentUuid: 'content-uuid',
    },
  }),
}));

vi.mock('@/components/general', () => ({
  PDFViewer: {
    name: 'PDFViewer',
    template: '<div><slot /></div>',
    props: ['source', 'enableDownload', 'page', 'pageCount'],
  },
}));

describe('PDFContent.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading message when PDF is loading', () => {
    const wrapper = shallowMount(PDFContent, {
      props: { contentPDFloading: true },
      global: {
        mocks: {
          $t: (msg: string) => msg,
        },
      },
    });
    expect(wrapper.text()).toContain('classroom.lessons:podcast.loading');
  });

  it('renders PDFViewer when not loading', async () => {
    const wrapper = mount(PDFContent, {
      props: { contentPDFloading: false },
      global: {
        mocks: {
          $t: (msg: string) => msg,
        },
      },
    });
    expect(wrapper.findComponent({ name: 'PDFViewer' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'PDFViewer' }).props('source')).toBe('http://example.com/file.pdf');
  });

  it('passes enableDownload prop to PDFViewer', () => {
    const wrapper = mount(PDFContent, {
      props: { contentPDFloading: false },
      global: {
        mocks: {
          $t: (msg: string) => msg,
        },
      },
    });
    expect(wrapper.findComponent({ name: 'PDFViewer' }).props('enableDownload')).toBe(true);
  });
});