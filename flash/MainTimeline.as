package MAIN_fla {
    import com.adobe.images.JPGEncoder;
    import com.dynamicflash.util.Base64;
    import flash.display.*;
    import flash.external.ExternalInterface;
    import flash.geom.Matrix;
    import flash.net.*;
    import flash.ui.*;
    import flash.utils.ByteArray;

    [SWF(width="900", height="520", backgroundColor="#ffffff", frameRate="30")]
    public dynamic class MainTimeline extends MovieClip {
        public var can: MovieClip;

        public var vFs: String;

        public var vLs: String;

        public var vEs: String;

        public var vNs: String;

        public var vCODs: String;

        public var vAs: Number;

        public var vIDAs: String;

        public var vIDOs: Number;

        public var vIDGs: Number;

        public var myCompatString: String;

        public var ldr: Loader;

        public var url: String;

        public var urlReq: URLRequest;

        public var conn: LocalConnection;

        public var myContextMenu: ContextMenu;

        public var item: ContextMenuItem;

        public function MainTimeline() {
            super();
            addFrameScript(0, frame1);
        }

        public function openURL(param1: String): * {
            ExternalInterface.call("popup", param1);
        }

        // Called by the editor engine (AS2) through LocalConnection when the avatar is saved.
        public function outputData(
            param1: String,
            param2: String,
            param3: String,
            param4: String,
            param5: String,
            param6: String,
            param7: String,
            param8: String,
            param9: String,
            param10: String,
            param11: String,
            param12: String,
            param13: String
        ): void {
            var desktop: Boolean = !ExternalInterface.available;
            var scale: Number = desktop ? 4 : Number(ExternalInterface.call("kaoExportScale"));

            if (isNaN(scale) || scale <= 0) {
                scale = 4;
            }

            // The avatar sits at x=900 at 180px (x4 already applied by the engine when f == "0").
            var drawScale: Number = param1 == "0" ? scale / 4 : scale;
            var size: int = Math.round(180 * scale);
            var bmp: BitmapData = new BitmapData(size, size, !desktop, desktop ? 0xFFFFFFFF : 0);

            bmp.draw(can, new Matrix(drawScale, 0, 0, drawScale, -900 * drawScale, 0), null, null, null, true);

            var name: String = param8 != null && param8 != "" ? param8 : param9;

            if (desktop) {
                // Standalone player: no page to talk to, save a JPEG through a native dialog.
                new FileReference().save(new JPGEncoder(95).encode(bmp), (name || "avatar") + "-" + size + "px.jpg");
                return;
            }

            // BitmapData.encode() is a no-op stub in Ruffle: ship raw ARGB pixels, zlib-compressed natively.
            var bytes: ByteArray = bmp.getPixels(bmp.rect);

            bytes.compress();
            ExternalInterface.call("kaoExport", {
                "format": "argb-zlib",
                "data": Base64.encodeByteArray(bytes),
                "width": size,
                "height": size,
                "ida": param10,
                "name": name
            });
        }

        internal function frame1(): * {
            stage.scaleMode = StageScaleMode.NO_SCALE;
            vFs = this.root.loaderInfo.parameters.vF;
            vLs = this.root.loaderInfo.parameters.vL;
            vEs = this.root.loaderInfo.parameters.vE;
            vNs = this.root.loaderInfo.parameters.vN;
            vAs = this.root.loaderInfo.parameters.vA;
            vIDAs = this.root.loaderInfo.parameters.vIDA;
            vCODs = this.root.loaderInfo.parameters.vCOD;
            vIDOs = this.root.loaderInfo.parameters.vIDO;
            vIDGs = this.root.loaderInfo.parameters.vIDG;
            myCompatString =
                "vF=" + vFs + "&vL=" + vLs + "&vE=" + vEs + "&vA=" + vAs + "&vN=" + vNs +
                "&vIDA=" + vIDAs + "&vCOD=" + vCODs + "&vIDO=" + vIDOs + "&vIDG=" + vIDGs;
            ldr = new Loader();
            url = "engine.swf?" + myCompatString;
            urlReq = new URLRequest(url);
            ldr.load(urlReq);
            can.addChild(ldr);
            conn = new LocalConnection();
            conn.client = this;
            conn.connect("myConn");
            item = new ContextMenuItem("Kao");
            myContextMenu = new ContextMenu();
            myContextMenu.hideBuiltInItems();
            myContextMenu.customItems.push(item);
            this.contextMenu = myContextMenu;
            stop();
        }
    }
}
