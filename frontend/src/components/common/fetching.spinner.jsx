const FetchingSpinner = ({ size = "md" }) => {
  const sizeClass = `loading-${size}`;

  return <span className={`loading loading-spinner ${sizeClass}`} />;
};
export default FetchingSpinner;
