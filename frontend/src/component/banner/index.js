import LottieControl from "../lottieView";
import * as panelData from "../../utils/panel.json";
// import "../../inspectionListView.css";

export const Banner = () => {
  return (
    <div class="banner">
      <div class="map">
        <div class="car"></div>
      </div>
      <div>
        <h1 style={{ color: "black", fontSize: "20px", marginTop: 15, marginBottom: 100 }}>
          Plan Efficiently with Pro-Inspector
        </h1>
      </div>
    </div>
  );
};
