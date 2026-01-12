import { Route, Routes } from "react-router-dom";
import Actionbuttons from "./components/Actionbuttons";
import Herosection from "./components/Herosection";
import Navbar from "./components/Navbar";
import Addrecord from "./Layout/Addrecord";
import Calculator from "./Layout/Calculator";
import Completeorder from "./Layout/Completeorder";
import Homepage from "./Layout/Homepage";
import PrivateRoute from "./components/PrivateRoute";
import Myshop from "./Layout/Myshop";
import Neworder from "./Layout/Neworder";
import Pendingorder from "./Layout/Pendingorder";
import Privacypolicy from "./Layout/Privacypolicy";
import Searchrecord from "./Layout/Searchrecord";
import Termandcondition from "./Layout/Termandcondition";
import Login from "./Layout/Login";
import Welcome from "./Layout/Welcomepage";
import Signup from "./Layout/Signup";
import Promotionpage from "./Layout/Promotionpage";
import Generateslip from "./Layout/Generateslip";
import Addexpense from "./Layout/Addexpense";
import Settings from "./Layout/Settings";
import Customerorder from "./Layout/Customerorder";
import Pendingorderslip from "./Layout/Pendingorderslip";
import Completedorderslip from "./Layout/Completedorderslip";
import Verificationpage from "./Layout/Verificationpage";
import Signupinfo from "./Layout/Signupinfo";
import ToastProvider from "./components/ToastProvider";
import ForgotPassword from "./Layout/ForgotPassword";
import ResetPassword from "./Layout/ResetPassword";
import Salesrecord from "./Layout/Salesrecord";
import Mynewshop from "./Layout/Mynewshop";
import { AiFillAmazonSquare } from "react-icons/ai";

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route
          path="/home-page"
          element={
            <PrivateRoute>
              <Homepage />
            </PrivateRoute>
          }
        />
        <Route path="/my-shop" element={<Myshop />} />
        <Route path="/termsandconditions" element={<Termandcondition />} />
        <Route path="/privacy-policy" element={<Privacypolicy />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/new-order" element={<Neworder />} />
        <Route path="/home-page" element={<Homepage />} />
        <Route path="/pending-order" element={<Pendingorder />} />
        <Route path="/complete-order" element={<Completeorder />} />
        <Route path="/search-record" element={<Searchrecord />} />
        <Route path="/add-record" element={<Addrecord />} />
        <Route path="/" element={<Welcome />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/signup" element={<Signupinfo />} />
        <Route path="/verifyemail" element={<Verificationpage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/salesrecord" element={<Salesrecord />} />
        <Route path="/addexpense" element={<Addexpense />} />
        <Route path="/generateslip" element={<Generateslip />} />
        <Route path="/mynewshop" element={<Mynewshop />} />
        <Route path="/pendingorderslip/:id" element={<Pendingorderslip />} />
        <Route path="/completeorderslip/:id" element={<Completedorderslip />} />
        <Route path="/setting" element={<Settings />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;
