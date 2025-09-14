document.querySelector(".menu-item a").addEventListener("click", function (e) {
  e.preventDefault();
  console.log("Clicked"); // <- This stops the link from navigating
});
