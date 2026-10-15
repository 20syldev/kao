import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Studio } from "@/components/studio/studio";

/**
 * Home page of every locale: header, editor workspace and author credit on the halftone background.
 */
export function Home() {
    return (
        <div className="halftone flex min-h-svh flex-col">
            <Header />
            <Studio />
            <Footer />
        </div>
    );
}
