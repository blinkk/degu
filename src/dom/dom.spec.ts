import * as is from '../is/is';
import {test} from '../testing/test-helpers';
import * as dom from './dom';
import {pjax} from './pjax';
import * as urlParams from './url-params';

test('Dom is defined', (t) => {
  t.is(is.defined(dom), true);
});

test('addStylesToPage injects style safely via textContent', (t) => {
  const payload = '.a { color: red; }</style><script>window.__xss=1</script>';
  dom.addStylesToPage(payload);
  const styles = document.head.querySelectorAll('style');
  const last = styles[styles.length - 1];
  t.is(last.textContent, payload);
  t.is(document.head.querySelector('script'), null);
});

test('urlParams.asObject blocks prototype pollution keys', (t) => {
  const parsed = urlParams.asObject(
    '?name=scott&__proto__=polluted&constructor=bad&prototype=bad'
  );
  t.deepEqual(parsed, {name: 'scott'});
  t.is(({} as Record<string, unknown>).polluted, undefined);
});

test('pjax.queryHtmlString extracts target innerHTML safely', (t) => {
  const result = pjax.queryHtmlString(
    '<html><head><title>Hi</title></head><body><div class="target"><span>ok</span></div></body></html>',
    '.target'
  );
  t.is(result, '<span>ok</span>');
});
