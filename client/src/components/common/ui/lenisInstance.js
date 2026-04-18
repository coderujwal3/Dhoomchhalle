let lenisInstance = null;

export const getLenis = () => lenisInstance;

export const setLenis = (instance) => {
  lenisInstance = instance;
};

export const clearLenis = () => {
  lenisInstance = null;
};
