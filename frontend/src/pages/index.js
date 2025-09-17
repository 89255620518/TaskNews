import { Helmet } from "react-helmet";
import CabinetPage from "./cabinet";

const HomePage = () => {

    return (
        <div style={{ background: "#ffffff" }}>
            <Helmet>
                <title>Тестовое задание</title>
            </Helmet>
            <CabinetPage />
        </div>
    )
}

export default HomePage;