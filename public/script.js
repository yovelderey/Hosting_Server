// ✅ ייבוא Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, get,onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// ✅ שליפת פרמטרים מה-URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// ✅ שליפת `eventId` ו- `guestId`
 // ✅ שליפת `uid`, `eventId`, `guestId`
 const uid     = getQueryParam("uid");
const uidFromUrl  = getQueryParam("uid");   // חדש
const eventId     = getQueryParam("eventId");
const guestId     = getQueryParam("guestId");

 if (!uid || !eventId || !guestId) {
     console.error("❌ uid / eventId / guestId ריקים! בדוק את הקישור שנשלח.");
 }

// ✅ אתחול Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB8LTCh_O_C0mFY...",
    authDomain: "final-project-d6ce7.firebaseapp.com",
    databaseURL: "https://final-project-d6ce7-default-rtdb.firebaseio.com",
    projectId: "final-project-d6ce7",
    storageBucket: "final-project-d6ce7.appspot.com",
    messagingSenderId: "1056060530572",
    appId: "1:1056060530572:web:d08d859ca2d25c46d340a9"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ✅ שליפת המשתמש ID מה-Firebase
async function resolveUid() {
  if (uidFromUrl) return uidFromUrl;        // ✅ הדרך הנכונה

  // אחרת – fallback (הקוד הישן שלך)
  const eventsRef = ref(database, "Events");
  try {
    const snap = await get(eventsRef);
    if (snap.exists()) {
      return Object.keys(snap.val())[0];    // 🟡 עלול להיות לא נכון, אבל זה עדיף מכלום
    }
  } catch (e) {
    console.error("שגיאה בשליפת UID:", e);
  }
  return null;
}

// ✅ שליפת פרטי האירוע והצגתם בדף
async function loadEventDetails() {
    const userUid = await resolveUid();
    if (!userUid) return;

    const eventRef = ref(database, `Events/${userUid}/${eventId}`);
    try {
        const snapshot = await get(eventRef);
        if (snapshot.exists()) {
            const eventData = snapshot.val();
            console.log("✅ נתוני האירוע שהתקבלו:", eventData);

            document.getElementById("eventName").textContent = eventData.eventName || "אירוע ללא שם";
            document.getElementById("Address").textContent = eventData.Address || "לא ידוע";
            document.getElementById("eventLocation").textContent = eventData.eventLocation || "לא ידוע";
            document.getElementById("eventDate").textContent = eventData.eventDate || "לא ידוע";
            document.getElementById("eventTime").textContent = eventData.eventTime || "לא ידוע";
            document.getElementById("eventPhone").textContent = eventData.Phone_Number || "לא ידוע";
        } else {
            console.error("❌ לא נמצא מידע לאירוע בפיירבייס.");
        }
    } catch (error) {
        console.error("❌ שגיאה בשליפת מידע על האירוע:", error);
    }
}

function isDarkColor(hexColor) {
    // ממיר צבע הקסדצימלי ל-RGB
    let r = parseInt(hexColor.substr(1, 2), 16);
    let g = parseInt(hexColor.substr(3, 2), 16);
    let b = parseInt(hexColor.substr(5, 2), 16);

    // חישוב בהירות הצבע (לפי כלל WCAG)
    let brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness < 128; // אם כהה - מחזיר true
}
async function loadStyles() {
    const userUid = await resolveUid();
    if (!userUid) {
        console.error("❌ לא נמצא משתמש!");
        return;
    }

    const stylesRef = ref(database, `Events/${userUid}/${eventId}/customColors`);

    // פונקציה לבדיקה אם צבע כהה או בהיר
    function isDarkColor(hexColor) {
        let r = parseInt(hexColor.substr(1, 2), 16);
        let g = parseInt(hexColor.substr(3, 2), 16);
        let b = parseInt(hexColor.substr(5, 2), 16);

        let brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < 128; // אם כהה - מחזיר true
    }
    
    // הוספת מאזין לפיירבייס
    onValue(stylesRef, (snapshot) => {
        if (snapshot.exists()) {
            const styles = snapshot.val();
            console.log("✅ עיצובים שהתקבלו מפיירבייס:", styles);
    
            let buttonBgColor = styles.attendanceBtnBgColor || "#FFFFFF"; // צבע רקע של הכפתור
            let textColorFromFirebase = styles.attendanceBtnTextColor || "#000000"; // צבע טקסט רגיל מהפיירבייס
            let selectedBgColor = styles.attendanceBtnSelectedColor || "#808080"; // צבע רקע במצב לחוץ
            let bgImageUrl = styles.bgImageUrl || ""; // URL לתמונת רקע (אם קיים)
    
            // פונקציה שבודקת האם צבע כהה
            function isDarkColor(hexColor) {
                let r = parseInt(hexColor.substr(1, 2), 16);
                let g = parseInt(hexColor.substr(3, 2), 16);
                let b = parseInt(hexColor.substr(5, 2), 16);
                let brightness = (r * 299 + g * 587 + b * 114) / 1000;
                return brightness < 128; // אם כהה - מחזיר true
            }
    
            // אם צבע הרקע כהה וגם צבע הטקסט כהה - שנה את הטקסט ללבן
            let buttonTextColor = isDarkColor(buttonBgColor) && isDarkColor(textColorFromFirebase) 
                ? "#FFFFFF" 
                : textColorFromFirebase;
    
            // אם צבע הרקע במצב `active` כהה - שנה את צבע הטקסט ללבן
            let buttonActiveTextColor = isDarkColor(selectedBgColor) 
                ? "#FFFFFF" 
                : styles.attendanceBtnTextColor;
    
            // ✅ עדכון **כל משתני העיצוב** בפיירבייס
            document.documentElement.style.setProperty('--button-bg', styles.buttonBgColor || '#FFFFFF');
            document.documentElement.style.setProperty('--button-text', styles.buttonTextColor || '#000000');
            document.documentElement.style.setProperty('--submit-bg', styles.submitBtnBgColor || '#000000');
            document.documentElement.style.setProperty('--title-color', styles.eventTitleColor || '#008000');
            document.documentElement.style.setProperty('--font-size', styles.fontSize || '18px');
            document.documentElement.style.setProperty('--border-radius', styles.borderRadius || '8px');
    
            // ✅ צבעים דינמיים לכפתורים
            document.documentElement.style.setProperty('--attendanceBtnBgColor', buttonBgColor || '#FFFFFF');
            document.documentElement.style.setProperty('--attendanceBtnSelectedColor', selectedBgColor || '#000000');
            document.documentElement.style.setProperty('--attendanceBtnTextColor', buttonTextColor);
            document.documentElement.style.setProperty('--attendanceBtnActiveTextColor', buttonActiveTextColor);
            document.documentElement.style.setProperty('--dynamic-text-color', buttonTextColor);
    
            // ✅ **עדכון רקע הדף (תמונה או צבע)**
            if (bgImageUrl) {
                document.documentElement.style.setProperty('--background-image', `url(${bgImageUrl})`);
                document.documentElement.style.setProperty('--background-color', 'transparent'); // שקוף אם יש תמונה
            } else {
                document.documentElement.style.setProperty('--background-image', 'none'); // בלי תמונה אם אין
                document.documentElement.style.setProperty('--background-color', styles.bgColor || '#FFFFFF');
            }
        } else {
            console.warn("⚠️ לא נמצאו עיצובים בפיירבייס.");
        }
    });
    
       

}


document.addEventListener("DOMContentLoaded", loadStyles);


// הפעלת פונקציית הטעינה בעת פתיחת האתר
document.addEventListener("DOMContentLoaded", loadStyles);



// ✅ שליפת תמונת האירוע והצגתה
async function loadEventImage() {
    const userUid = await resolveUid();
    if (!userUid) return;

    const imageRef = ref(database, `Events/${userUid}/${eventId}/imageUrl`);
    try {
        const snapshot = await get(imageRef);
        if (snapshot.exists()) {
            const imageUrl = snapshot.val();
            if (imageUrl) {
                document.getElementById("eventImage").src = imageUrl;
            }
        }
    } catch (error) {
        console.error("❌ שגיאה בטעינת התמונה:", error);
    }
}

// ✅ שליפת פרטי האורח
async function getGuestName(userUid) {
    const contactsRef = ref(database, `Events/${userUid}/${eventId}/contacts/${guestId}`);
    try {
        const snapshot = await get(contactsRef);
        if (snapshot.exists()) {
            const guestData = snapshot.val();
            console.log("✅ נמצא אורח:", guestData.displayName);
            return guestData.displayName || "אורח ללא שם";
        } else {
            console.error("❌ לא נמצא מידע על האורח.");
            return "אורח ללא שם";
        }
    } catch (error) {
        console.error("❌ שגיאה בשליפת מידע על האורח:", error);
        return "אורח ללא שם";
    }
}

// ✅ משתנים לשמירת בחירת המשתמש
let numberOfGuests = 0;

// ✅ משתנים לשמירת בחירת המשתמש
let selectedResponse = "";

// ✅ פונקציה לטיפול בלחיצה על כפתור בחירה
function handleSelection(type) {
    selectedResponse = type;

    // הסרת העיצוב מהכפתורים
    document.getElementById("yesBtn").classList.remove("btn-selected", "active");
    document.getElementById("maybeBtn").classList.remove("btn-selected", "active");
    document.getElementById("noBtn").classList.remove("btn-selected", "active");

    // הוספת העיצוב לכפתור שנבחר
    if (type === "מגיע") {
        document.getElementById("yesBtn").classList.add("btn-selected", "active");
    } else if (type === "אולי") {
        document.getElementById("maybeBtn").classList.add("btn-selected", "active");
    } else {
        document.getElementById("noBtn").classList.add("btn-selected", "active");
    }

    // ✅ הצגת שדה "כמות מוזמנים" רק בלחיצה על "מגיע"
    const guestsContainer = document.getElementById("guestsContainer");
    if (type === "מגיע") {
        guestsContainer.style.display = "block"; // מציג את השדה
    } else {
        guestsContainer.style.display = "none"; // מסתיר את השדה
    }

    // הצגת כפתור "שלח"
    document.getElementById("submitBtn").classList.remove("hidden");
}


// ✅ הוספת אירועים לכפתורים בעת טעינת הדף
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("yesBtn").addEventListener("click", () => handleSelection("מגיע"));
    document.getElementById("maybeBtn").addEventListener("click", () => handleSelection("אולי"));
    document.getElementById("noBtn").addEventListener("click", () => handleSelection("לא מגיע"));
});



// ✅ שליחת תגובה לפיירבייס
async function submitResponse() {
    if (!eventId || !guestId) {
        alert("❌ eventId או guestId חסרים!");
        return;
    }

    const userUid = await resolveUid();
    if (!userUid) {
        alert("❌ המשתמש לא נמצא!");
        return;
    }

    const guestName = await getGuestName(userUid);

    if (selectedResponse === "מגיע") {
        numberOfGuests = document.getElementById("numGuests").value;
        if (!numberOfGuests || isNaN(numberOfGuests) || numberOfGuests < 1) {
            alert("❌ יש להזין מספר משתתפים תקין!");
            return;
        }
    } else {
        numberOfGuests = 0;
    }

    const responseRef = ref(database, `Events/${userUid}/${eventId}/responses/${guestId}`);

    set(responseRef, {
        guestName,
        response: selectedResponse,
        numberOfGuests: numberOfGuests,
        timestamp: new Date().toISOString()
    })
    .then(() => {
        alert(`✅ ${guestName}, תשובתך "${selectedResponse}" נרשמה בהצלחה!`);
    })
    .catch((error) => {
        console.error("❌ שגיאה בשליחה לפיירבייס:", error);
        alert("❌ שגיאה בשליחת הנתונים");
    });
}

// ✅ טעינת הנתונים והתמונה בעת פתיחת הדף
document.addEventListener("DOMContentLoaded", async function () {
    handleSelection("לא נגיע"); // הגדרת הכפתור "לא נגיע" כבחירה ראשונית
    await loadEventDetails();
    await loadEventImage();

    document.getElementById("yesBtn").addEventListener("click", () => handleSelection("מגיע"));
    document.getElementById("maybeBtn").addEventListener("click", () => handleSelection("אולי"));
    document.getElementById("noBtn").addEventListener("click", () => handleSelection("לא מגיע"));

    document.getElementById("submitBtn").addEventListener("click", submitResponse);
});

document.getElementById("navigateBtn").addEventListener("click", function () {
    const location = document.getElementById("eventLocation").textContent;
    if (location && location !== "לא ידוע") {
        const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(location)}`;
        window.open(wazeUrl, "_blank");
    } else {
        alert("❌ כתובת האירוע לא זמינה!");
    }
});

document.getElementById("addToCalendarBtn").addEventListener("click", function () {
    const eventTitle = document.getElementById("eventName").textContent || "אירוע";
    const eventLocation = document.getElementById("eventLocation").textContent;
    const eventDate = document.getElementById("eventDate").textContent.replace("📅 תאריך: ", "").trim();
    const eventTime = document.getElementById("eventTime").textContent.replace("⏰ שעה: ", "").trim();

    if (!eventDate || eventDate === "לא ידוע") {
        alert("❌ תאריך האירוע לא זמין!");
        return;
    }

    // המרה לפורמט ICS - מתאים לאפל
    const formattedDate = eventDate.replace(/-/g, ""); // YYYYMMDD
    const formattedTime = eventTime ? eventTime.replace(":", "") + "00" : "120000"; // HHMMSS
    const startDateTime = `${formattedDate}T${formattedTime}`;
    const endDateTime = `${formattedDate}T${(parseInt(formattedTime) + 10000).toString().padStart(6, "0")}`; // +1 שעה

    // יצירת קובץ ICS עבור Apple Calendar
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${eventTitle}
LOCATION:${eventLocation}
DTSTART:${startDateTime}
DTEND:${endDateTime}
DESCRIPTION:אירוע שהוזמנת אליו
END:VEVENT
END:VCALENDAR`;

    // יצירת קובץ להורדה
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);

    // בדיקת סוג המכשיר
    if (navigator.userAgent.includes("iPhone") || navigator.userAgent.includes("Mac OS")) {
        // אם זה iPhone או Mac, פותחים קובץ ICS
        const a = document.createElement("a");
        a.href = url;
        a.download = "event.ics";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        // אם זה מכשיר אחר - פותחים Google Calendar
        const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDateTime}Z/${endDateTime}Z&details=${encodeURIComponent("אירוע שהוזמנת אליו")}&location=${encodeURIComponent(eventLocation)}`;
        window.open(calendarUrl, "_blank");
    }
});

