const formElement = document.getElementById("form");

formElement.addEventListener("submit", (event) => {
  event.preventDefault();

  var domain = document.getElementById("domain").value;
  var origen = document.getElementById("origen").value;

  if (origen == "Local") {
    fetch("https://tracerouteud-api.vercel.app/tracert/Local")
      .then((response) => response.json())
      .then((data) => {
        var ips = [];
        if (domain == "google.com") {
          traza = data.google.saltos;
        }
        if (domain == "youtube.com") {
          traza = data.youtube.saltos;
        }
        if (domain == "facebook.com") {
          traza = data.facebook.saltos;
        }
        eliminarFilas();
        for (let i = 0; i < Object.keys(traza).length; i++) {
          agregarFila(
            traza[i].number,
            traza[i].nodo,
            traza[i].t[0],
            traza[i].t[1],
            traza[i].t[2]
          );
          if (traza[i].nodo != "*" && traza[i].nodo != "Internal") {
            ips.push({ n: i + 1, ip: traza[i].nodo });
          }
        }

        fetch("https://tracerouteud-api.vercel.app/ips", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ips),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
            initMap(data);
          });

        let info = document.getElementById("info");
        info.style.display = "flex";
        info.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "center",
        });
      });
  } else {
    var traza;

    fetch(`https://tracerouteud-api.vercel.app/tracert/${origen}`)
      .then((response) => response.json())
      .then((data) => {
        let ips = [];
        if (domain == "google.com") {
          traza = data.google.saltos;
        }
        if (domain == "youtube.com") {
          traza = data.youtube.saltos;
        }
        if (domain == "facebook.com") {
          traza = data.facebook.saltos;
        }
        eliminarFilas();
        for (let i = 0; i < Object.keys(traza).length; i++) {
          agregarFila(
            traza[i].number,
            traza[i].nodo,
            traza[i].t[0],
            traza[i].t[1],
            traza[i].t[2]
          );
          if (traza[i].nodo != "*" && traza[i].nodo != "Internal") {
            ips.push({ n: i + 1, ip: traza[i].nodo });
          }
        }

        fetch("https://tracerouteud-api.vercel.app/ips", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ips),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
            initMap(data);
          });

        let info = document.getElementById("info");
        info.style.display = "flex";
        info.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "center",
        });
      });
  }
});

// function IPSinfo(ips) {
//   var arrayUbicaciones = [];
//   for (let i = 0; i < ips.length; i++) {
//     var query = ips[i].ip;
//     fetch(`http://ip-api.com/json/${query}?fields=status,lat,lon,isp`)
//       .then((x) => x.json())
//       .then((data) => {
//         arrayUbicaciones.push({ n: ips[i].n, data });
//         if (arrayUbicaciones.length == ips.length) {
//           console.log(arrayUbicaciones.sort((a, b) => (a.n > b.n ? 1 : -1)));
//           initMap(arrayUbicaciones.sort((a, b) => (a.n > b.n ? 1 : -1)));
//         }
//       });
//   }
// }

function agregarFila(Paso, IPv4, t1, t2, t3) {
  document
    .getElementById("t")
    .insertRow(
      -1
    ).innerHTML = `<td>${Paso}</td><td>${IPv4}</td><td>${t1}</td><td>${t2}</td><td>${t3}</td>`;
}

function eliminarFilas() {
  const table = document.getElementById("t");
  let rowCount = table.rows.length;

  while (rowCount > 1) {
    table.deleteRow(rowCount - 1);
    rowCount--;
  }
}

function initMap(arrayUbicaciones) {
  var map;
  var coords = [];
  var labels = [];
  if (navigator.geolocation) {
    if (arrayUbicaciones == undefined) {
      var map = new google.maps.Map(document.getElementById("gmap"), {
        mapTypeId: "terrain",
        center: { lat: -34.397, lng: 150.644 },
        streetViewControl: false,
        disableDefaultUI: true,
        zoom: 3,
        minZoom: 3,
        maxZoom: 12,
      });

      var infoWindow = new google.maps.InfoWindow({
        content: "",
        disableAutoPan: true,
      });
      navigator.geolocation.getCurrentPosition((position) => {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        // console.log(pos.lat, pos.lng)
        map.setCenter(pos);
      });
    } else {
      var map = new google.maps.Map(document.getElementById("gmap"), {
        mapTypeId: "terrain",
        center: { lat: -34.397, lng: 150.644 },
        streetViewControl: false,
        disableDefaultUI: true,
        zoom: 3,
        minZoom: 3,
        maxZoom: 12,
      });

      Object.keys(arrayUbicaciones).map((key, i) => {
        let lati = arrayUbicaciones[i].data.lat;
        let longi = arrayUbicaciones[i].data.lon;
        if (arrayUbicaciones[i].data.status == "success") {
          if (i == 0) {
            coords.push({
              lat: arrayUbicaciones[i].data.lat,
              lng: arrayUbicaciones[i].data.lon,
            });
            labels.push(`${arrayUbicaciones[i].n}`);
          } else {
            if (
              arrayUbicaciones[i - 1].data.lat == lati &&
              arrayUbicaciones[i - 1].data.lon == longi
            ) {
              labels[labels.length - 1] += `, ${arrayUbicaciones[i].n}`;
            } else {
              coords.push({
                lat: arrayUbicaciones[i].data.lat,
                lng: arrayUbicaciones[i].data.lon,
              });
              labels.push(`${arrayUbicaciones[i].n}`);
            }
          }
        }
      });
      var infoWindow = new google.maps.InfoWindow({
        content: "",
        disableAutoPan: true,
      });

      const markers = coords.map((position, i) => {
        const label = labels[i];
        const marker = new google.maps.Marker({
          position,
          label,
          map,
        });
        marker.addListener("click", () => {
          infoWindow.setContent(label);
          infoWindow.open(map, marker);
        });
        map.setCenter(position);
        return marker;
      });

      const polyLines = new google.maps.Polyline({
        path: coords,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });
      polyLines.setMap(map);
    }
  }
}

window.initMap = initMap;
