document.addEventListener("DOMContentLoaded", function () {
  // Get all required elements
  const brandSlider = document.querySelector(".jv-brand-slider");
  const brandCards = document.querySelectorAll(".jv-brand-card");
  const totalOriginalCards = brandCards.length / 2; // We have duplicated cards for smooth scrolling

  // Calculate and set the width for the slider and cards
  brandSlider.style.width = brandCards.length * 100 + "%";

  brandCards.forEach((card) => {
    card.style.minWidth = "768px";
    card.style.maxWidth = "950px";
  });

  // Update the animation keyframe for smooth scrolling
  const styleSheet = document.styleSheets[0];
  let keyframeRules;

  // Find the animation keyframes
  for (let i = 0; i < styleSheet.cssRules.length; i++) {
    if (
      styleSheet.cssRules[i].type === CSSRule.KEYFRAMES_RULE &&
      styleSheet.cssRules[i].name === "jv-slide"
    ) {
      keyframeRules = styleSheet.cssRules[i];
      break;
    }
  }

  // Calculate how much to slide (should be equal to the width of original cards)
  const slidePercentage = (totalOriginalCards / brandCards.length) * 100;

  // Update the animation keyframes if found
  if (keyframeRules) {
    // Find the 100% keyframe and update it
    for (let i = 0; i < keyframeRules.cssRules.length; i++) {
      const rule = keyframeRules.cssRules[i];
      if (rule.keyText === "100%") {
        rule.style.transform = `translateX(-${slidePercentage}%)`;
        break;
      }
    }
  }
});
