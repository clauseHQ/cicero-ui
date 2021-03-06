import React from 'react';
import { render } from '@testing-library/react';
import { SlateTransformer } from '@accordproject/markdown-slate';
import { Chance } from 'chance';
import { Value } from 'slate';
import ContractEditor from './index';

const slateTransformer = new SlateTransformer();
const chance = new Chance();

const props = {
  value: null,
  onChange: () => 1,
  lockText: true,
  template: {},
  loadTemplateObject: () => 1,
  onClauseUpdated: () => 1,
  editorProps: {
    BUTTON_BACKGROUND_INACTIVE: null,
    BUTTON_BACKGROUND_ACTIVE: null,
    BUTTON_SYMBOL_INACTIVE: null,
    BUTTON_SYMBOL_ACTIVE: null,
    DROPDOWN_COLOR: null,
    TOOLBAR_BACKGROUND: null,
    TOOLTIP_BACKGROUND: null,
    TOOLTIP: null,
    TOOLBAR_SHADOW: null,
    WIDTH: '600px',
  }
};

const setup = (content = null) => {
  const ref = React.createRef();
  const value = content ? Value.fromJSON(slateTransformer.fromMarkdown(content)) : null;
  return render(<ContractEditor {...props} value={value} ref={ref} />);
};

beforeAll(() => {
  window.getSelection = () => ({
    removeAllRanges: () => {}
  });

  global.document.createRange = () => ({
    setStart: () => {},
    setEnd: () => {},
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: document,
    },
  });
});

describe('<ContractEditor />', () => {
  describe('on initialization', () => {
    it('renders page correctly', () => {
      const { baseElement } = setup();
      expect(baseElement).toMatchSnapshot();
    });

    it('should render specified value', () => {
      const content = chance.sentence();
      const container = setup(content);
      const editor = container.getByTestId('editor');
      expect(editor.textContent).toEqual(content);
    });
  });

  describe('on formatting', () => {
    it.skip('should render hyperlink properly', async () => {
      const text = chance.sentence({ words: 2 });
      const url = chance.url();
      setup(`[${text}](${url})`);
      const link = document.querySelector(`a[href='${url}']`);
      expect(link).toBeTruthy();
      expect(link.textContent).toBe(text);
      expect(link.href).toBe(url);
    });

    it('should render bold properly', () => {
      const text = chance.sentence({ words: 2 });
      setup(`**${text}**`);
      expect(document.querySelector('strong').textContent).toBe(text);
    });

    it('should render italic properly', () => {
      const text = chance.sentence({ words: 2 });
      setup(`*${text}*`);
      expect(document.querySelector('em').textContent).toBe(text);
    });

    it('should render code properly', () => {
      const text = chance.hashtag();
      setup(`\`${text}\``);
      expect(document.querySelector('code').textContent).toBe(text);
    });

    it('should render blockquote properly', () => {
      const first = chance.sentence();
      const secondSentence = chance.sentence();
      setup(`> ${first}\n> ${secondSentence}`);
      expect(document.querySelector('blockquote').textContent).toMatch(first);
      expect(document.querySelector('blockquote').textContent).toMatch(secondSentence);
    });
  });
});
