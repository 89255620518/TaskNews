import LoginComponent from "../component/AuthComponent/LoginComponent/loginComponent";
import { Helmet } from "react-helmet";


const LoginPage = () => {

    return (
        <div style={{ background: "#ffffff" }}>
            <Helmet>
                <title>ТЗ/Авторизация</title>
            </Helmet>
            <LoginComponent />
        </div>
    )
}

export default LoginPage;