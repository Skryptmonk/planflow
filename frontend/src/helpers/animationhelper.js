class MapAnimationHelper
{
    Map = undefined;
    LatLng = undefined;
    constructor(map, latLng)
    {
        this.Map = map;
        this.LatLng = latLng;
    }

    Init()
    {

    }

    lineOffsetChanged()
    {

    }

    AnimateIcon() {
        let lineOffset = 0;
        let iconSpeed = 0.2;
        //move the icon
        setInterval(function () {
            lineOffset = (lineOffset + iconSpeed) % 200;
            lineOffsetChanged(offset);
        }, 20);
    }
}