// Fix URL.protocol getter-only issue in React Native 0.76
try {
  if (typeof URL !== 'undefined') {
    const desc = Object.getOwnPropertyDescriptor(URL.prototype, 'protocol');
    if (desc && desc.get && !desc.set) {
      Object.defineProperty(URL.prototype, 'protocol', {
        get: desc.get,
        set: function () {},
        configurable: true,
      });
    }
  }
} catch (e) {}
