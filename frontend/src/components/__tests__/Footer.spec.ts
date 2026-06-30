import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Footer from '../Footer.vue';

describe('Footer', () => {
  it('renders contact information', () => {
    const wrapper = mount(Footer);
    expect(wrapper.text()).toContain("Developed by the Chen LL's Lab at Guangxi University");
    expect(wrapper.text()).toContain('Contact: 2408391061@st.gxu.edu.cn');
  });
});
