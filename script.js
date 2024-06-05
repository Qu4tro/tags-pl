function myGetFn(obj, path) {
  path = Array.isArray(path) ? path : path.split(".");
  for (let i = 0, len = path.length; i < len; i++) {
    if (!obj.hasOwnProperty(path[i])) {
      return null;
    }
    obj = obj[path[i]];
  }
  if (typeof obj === "string") {
    return obj.normalize("NFD").replace(/[\u0300-\u036F]/g, "");
  }
  return obj;
}

fetch("data.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }
    return response.json();
  })
  .then((json) => {
    var options = {
      keys: [
        {
          name: "type",
          weight: 0.1,
        },
        {
          name: "question",
          weight: 0.7,
        },
        {
          name: "answer",
          weight: 0.1,
        },
        {
          name: "image_tags",
          weight: 0.1,
        },
      ],
      minMatchCharLength: 2,
      ignoreLocation: true,
      getFn: myGetFn,
    };

    var fuse = new Fuse(json, options);

    const types = [...new Set(json.map((item) => item.type))];
    const dropdown = document.getElementById("filter-type");
    types.forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.innerText = type;
      dropdown.appendChild(option);
    });

    dropdown.addEventListener("change", function () {
      // Clear previous results
      var listResult = document.getElementById("list-result");
      listResult.innerHTML = "";

      // Filter data based on the selected type
      const selectedType = this.value;
      const result = json.filter((item) => item.type === selectedType);

      // Display the questions and answers
      result.forEach((item) => {
        var div = document.createElement("div");
        div.className = "result-item";

        var type = document.createElement("div");
        type.className = "type";
        type.textContent = item.type;
        div.appendChild(type);

        var question = document.createElement("div");
        question.className = "question";
        question.innerHTML = item.question.replace(/\n/g, "<br>");
        div.appendChild(question);

        var answer = document.createElement("div");
        answer.className = "answer";
        answer.textContent = "Resposta: " + item.answer;
        div.appendChild(answer);

        if (item.image_src) {
          var image_wrapper = document.createElement("div");
          image_wrapper.className = "image_wrapper";

          var img = document.createElement("img");
          img.className = "image";
          img.src = item.image_src;

          image_wrapper.appendChild(img);
          div.appendChild(image_wrapper);
        }

        listResult.appendChild(div);
      });
    });

    document.getElementById("search").oninput = function () {
      //console.log("oi1");
      //console.log(json);
      document.getElementById("result").innerHTML = "";

      var result = fuse.search(this.value);
      //console.log(result);

      result.forEach((item) => {
        var div = document.createElement("div");
        div.className = "result-item";

        var type = document.createElement("div");
        type.className = "type";
        type.textContent = item.item.type;
        div.appendChild(type);

        var question = document.createElement("div");
        question.className = "question";
        question.innerHTML = item.item.question.replace(/\n/g, "<br>");
        div.appendChild(question);

        var answer = document.createElement("div");
        answer.className = "answer";
        answer.textContent = "Resposta: " + item.item.answer;
        div.appendChild(answer);

        if (item.item.image_src) {
          var img = document.createElement("img");
          img.className = "image";
          img.src = item.item.image_src;
          div.appendChild(img);
        }

        //console.log("oi2");
        document.getElementById("result").appendChild(div);
      });
    };
  })
  .catch(function (error) {
    console.log("An error occurred while fetching the JSON data.");
    var errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent =
      "An error occurred while fetching the JSON data: " + error.message;
    document.body.appendChild(errorDiv);
  });

document.querySelectorAll("#menu a").forEach((link) => {
  link.onclick = function (event) {
    if (event.target.getAttribute("id") !== "manual") {
      event.preventDefault();

      // hide all views
      document
        .querySelectorAll("#search-view, #list-view, #ref-view")
        .forEach((view) => {
          view.style.display = "none";
        });

      // show the clicked view
      document.querySelector(event.target.getAttribute("href")).style.display =
        "flex";
    }
  };
});
