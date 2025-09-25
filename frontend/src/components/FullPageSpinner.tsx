import './fullPageSpinner.css';

export const FullPageSpinner = () => (
  <div className="full-page-spinner">
    <div className="spinner" aria-hidden="true" />
    <span className="sr-only">Loading...</span>
  </div>
);
