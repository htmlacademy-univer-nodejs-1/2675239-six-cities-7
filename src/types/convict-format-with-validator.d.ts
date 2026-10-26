declare module 'convict-format-with-validator' {
  import convict = require('convict');
  const formats: Record<string, convict.Format>;
  export default formats;
}
