import { useEffect, useState } from "react";
import styles from "./LandingPage.module.css";
import { db } from "../../firebase";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

const LandingPage = () => {
  const domain = `https://joinmidson-ochre.vercel.app`;
  const [whatsAppNumber, setWhatsAppNumber] = useState("");

  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const metaDocRef = doc(db, "meta", "landingpage");
        const metaDocSnapshot = await getDoc(metaDocRef);

        if (metaDocSnapshot.exists()) {
          const metaData = metaDocSnapshot.data();
          const number = metaData.whatsAppNumber.substring(
            1,
            metaData.whatsAppNumber.length
          );
          setWhatsAppNumber(number);
        }
      } catch (error) {
        console.error("Error fetching meta data:", error);
      }
    };

    fetchMetaData();
  }, []);

  const whatsAppDomain = "https://api.whatsapp.com/send?phone=";

  console.log(whatsAppNumber);

  const [currentUser, setCurrentUser] = useState({
    id: "",
    name: "",
    email: "",
    address: "",
    phone: "",
    gender: "",
    age: "",
    referBy: { id: "", company: "", name: "", domain: "" },
  });
  const [CMSData, setCMSData] = useState({});
  const { userId, companyName } = useParams();
  const [referByUser, setReferByUser] = useState(null);

  useEffect(() => {
    const loadCMSData = async () => {
      const docRef = doc(db, "meta", "landingpage");
      const docSnap = await getDoc(docRef);

      setCMSData(docSnap.data());
    };

    loadCMSData();
  }, []);

  const makeid = () => {
    var length = 20;
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  };

  const createUser = async (currentUserID, newUser) => {
    try {
      await setDoc(doc(db, "users", currentUserID), newUser);

      toast.success("user created!");
      setCurrentUser((prevData) => ({ ...prevData, id: currentUserID }));

      return currentUserID;
    } catch (error) {
      toast.error("couldn't create user!");
      return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const updateUser = async (user) => {
    try {
      const userDoc = doc(db, "users", userId);
      await updateDoc(userDoc, user);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      currentUser.name !== "" &&
      currentUser.email !== "" &&
      currentUser.phone !== "" &&
      currentUser.address !== "" &&
      currentUser.gender !== "Gender" &&
      currentUser.age !== ""
    ) {
      if (userId && userId !== "") {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);

        var tempData = docSnap.data();
        var tempReferByUser = { id: docSnap.id, ...tempData };

        setReferByUser({ id: docSnap.id, ...tempData });
        const referBy = {
          id: userId,
          company: companyName !== undefined ? companyName : "",
          name: tempReferByUser.name,
          domain,
        };
        setCurrentUser((prevData) => ({
          ...prevData,
          referBy: referBy,
        }));

        const createdUserID = makeid();

        const newUser = {
          name: currentUser.name,
          email: currentUser.email,
          phoneNumber: currentUser.phone,
          age: currentUser.age,
          gender: currentUser.gender,
          address: currentUser.address,
          createdBy: { email: "landingpage" },
          createdAt: serverTimestamp(),
          referBy: referBy,
        };

        createUser(createdUserID, newUser);

        if (createdUserID !== null) {
          var referToLink = "";
          if (companyName !== undefined) {
            referToLink = domain + "/" + userId + "/" + companyName;
          } else {
            referToLink = domain + "/" + userId;
          }
          var referTo = {
            id: createdUserID,
            name: currentUser.name,
            link: referToLink,
            company: companyName !== undefined ? companyName : "",
          };

          var temp;

          if (tempReferByUser && tempReferByUser.referTo !== undefined) {
            temp = [...tempReferByUser.referTo, referTo];
          } else {
            temp = [referTo];
          }

          setReferByUser((prevData) => ({ ...prevData, referTo: temp }));

          tempReferByUser.referTo = temp;

          const updatedUser = updateUser(tempReferByUser);

          if (updatedUser) {
            toast.success("User created successfully!");
            if (companyName === undefined) {
              const text = `*Name:* ${currentUser.name}
               *Email:* ${currentUser.email}
               *Phone Number:* ${currentUser.phone}
               *Age:* ${currentUser.age}
               *Gender:* ${currentUser.gender}
               *Address:* ${currentUser.address}
               *Referred By:* ${referBy.name}
              `;

              const wlink =
                whatsAppDomain +
                encodeURIComponent(whatsAppNumber) +
                "&text=" +
                encodeURIComponent(text);

              window.location.replace(wlink);
            } else {
              const text = `*Name:* ${currentUser.name}
               *Email:* ${currentUser.email}
               *Phone Number:* ${currentUser.phone}
               *Age:* ${currentUser.age}
               *Gender:* ${currentUser.gender}
               *Address:* ${currentUser.address}
               *Referred By:* ${referBy.name}
               *Referred By (Company Name):* ${referBy.company}
              `;
              const wlink =
                whatsAppDomain +
                encodeURIComponent(whatsAppNumber) +
                "&text=" +
                encodeURIComponent(text);
              window.location.replace(wlink);
            }
          } else {
            toast.error("Some error occurred");
          }
        }
      } else {
        const createdUserID = makeid();
        const newUser = {
          name: currentUser.name,
          email: currentUser.email,
          phoneNumber: currentUser.phone,
          age: currentUser.age,
          gender: currentUser.gender,
          address: currentUser.address,
          createdBy: { email: "landingpage" },
          createdAt: serverTimestamp(),
          referBy: currentUser.referBy,
        };

        createUser(createdUserID, newUser);

        const text = `*Name:* ${currentUser.name}
         *Email:* ${currentUser.email}
         *Phone Number:* ${currentUser.phone}
         *Age:* ${currentUser.age}
         *Gender:* ${currentUser.gender}
         *Address:* ${currentUser.address}
        `;

        const wlink =
          whatsAppDomain +
          encodeURIComponent(whatsAppNumber) +
          "&text=" +
          encodeURIComponent(text);

        window.location.replace(wlink);
      }
    } else {
      toast.error("All fields are mandatory");
    }
  };

  return (
    <div className={styles["landing-page"]}>
      <header className={styles["header"]}>
        <h1>Join Midson</h1>
      </header>
      <div className={styles["top-section"]}>
        <div className={styles["left-section"]}>
          <form onSubmit={handleSubmit}>
            <h3>Register!</h3>
            <label className={styles["label"]}>Name: </label>
            <input
              value={currentUser.name}
              type="text"
              name="name"
              onChange={handleChange}
            />
            <label className={styles["label"]}>Email:</label>
            <input
              value={currentUser.email}
              type="email"
              name="email"
              onChange={handleChange}
            />
            <label className={styles["label"]}>Age:</label>
            <input
              value={currentUser.age}
              type="text"
              name="age"
              onChange={handleChange}
            />
            <label className={styles["label"]}>Gender:</label>
            <select
              name="gender"
              value={currentUser.gender}
              onChange={handleChange}
            >
              <option>Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <label className={styles["label"]}>Address:</label>
            <input
              value={currentUser.address}
              type="text"
              name="address"
              onChange={handleChange}
            />
            <label className={styles["label"]}>Phone Number:</label>
            <input
              value={currentUser.phone}
              type="tel"
              name="phone"
              onChange={handleChange}
            />
            <button className={styles["button"]} type="submit">
              Submit
            </button>
          </form>
        </div>
        <div className={styles["right-section"]}>
          <img src={CMSData?.img_src} alt="Midson Logo" />
        </div>
      </div>
      <div className={styles["bottom-section"]}>
        <div className={styles.box}>
          <h3>{CMSData?.section1?.heading}</h3>
          <p>{CMSData?.section1?.content}</p>
        </div>
        <div className={styles.box}>
          <h3>{CMSData?.section2?.heading}</h3>
          <p>{CMSData?.section2?.content}</p>
        </div>
        <div className={styles.box}>
          <h3>{CMSData?.section3?.heading}</h3>
          <p>{CMSData?.section3?.content}</p>
        </div>
        <div className={styles.box}>
          <h3>{CMSData?.section4?.heading}</h3>
          <p>{CMSData?.section4?.content}</p>
        </div>
      </div>
      <footer className={styles["footer"]}>
        <div>
          <h1> Midson</h1>
        </div>
        <div className={styles["info"]}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms and Conditions</a>
          <a href="#">License</a>
          <a href="#">Copyright</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
