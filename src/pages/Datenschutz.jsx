const ae = '\u00e4'
const oe = '\u00f6'
const ue = '\u00fc'

const localizedPrivacy = {
  english: {
    title: 'Privacy policy', sections: [
      ['1. Controller', 'The MyFlow project group at Hochschule Ruhr West is responsible for processing data in the MyFlow app.'],
      ['2. Data processed', 'Depending on use, account details, profile data, settings, goals, routines, check-ins, calendar entries, uploaded images and app usage data may be stored.'],
      ['3. Purpose', 'The data is used only to provide app features, manage routines and personalize recommendations. It is not used for advertising.'],
      ['4. Your rights', 'You may request access, correction or deletion of your data and object to processing where permitted by law.'],
      ['Notice', 'MyFlow does not provide medical advice and does not replace professional diagnosis or treatment.'],
      ['Legal notice', 'MyFlow is a student project of Hochschule Ruhr West for demonstration and learning purposes.'],
    ],
  },
  turkish: {
    title: 'Gizlilik politikası', sections: [
      ['1. Sorumlu', 'MyFlow uygulamasındaki veri işlemeden Hochschule Ruhr West MyFlow proje grubu sorumludur.'],
      ['2. İşlenen veriler', 'Kullanıma bağlı olarak hesap bilgileri, profil verileri, ayarlar, hedefler, rutinler, check-in verileri, takvim kayıtları, yüklenen resimler ve kullanım verileri saklanabilir.'],
      ['3. Amaç', 'Veriler yalnızca uygulama işlevlerini sunmak, rutinleri yönetmek ve önerileri kişiselleştirmek için kullanılır. Reklam amacıyla kullanılmaz.'],
      ['4. Hakların', 'Verilerine erişim, düzeltme veya silme talep edebilir ve yasal olarak mümkün olduğunda işlemeye itiraz edebilirsin.'],
      ['Uyarı', 'MyFlow tıbbi tavsiye vermez ve profesyonel tanı veya tedavinin yerini almaz.'],
      ['Yasal bildirim', 'MyFlow, Hochschule Ruhr West tarafından gösterim ve öğrenme amacıyla geliştirilen bir öğrenci projesidir.'],
    ],
  },
  arabic: {
    title: 'سياسة الخصوصية', sections: [
      ['1. الجهة المسؤولة', 'مجموعة مشروع MyFlow في جامعة Hochschule Ruhr West هي المسؤولة عن معالجة البيانات في التطبيق.'],
      ['2. البيانات التي تتم معالجتها', 'حسب الاستخدام، قد يتم حفظ بيانات الحساب والملف والإعدادات والأهداف والروتينات وتسجيلات الدخول والتقويم والصور وبيانات الاستخدام.'],
      ['3. الغرض', 'تستخدم البيانات فقط لتوفير وظائف التطبيق وإدارة الروتينات وتخصيص التوصيات. لا تستخدم للإعلان.'],
      ['4. حقوقك', 'يمكنك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها والاعتراض على معالجتها حيث يسمح القانون.'],
      ['تنبيه', 'لا يقدم MyFlow استشارة طبية ولا يحل محل التشخيص أو العلاج المهني.'],
      ['الإشعار القانوني', 'MyFlow مشروع طلابي في Hochschule Ruhr West لأغراض العرض والتعلم.'],
    ],
  },
}

function Datenschutz({ backTarget = 'profileSettings', onNavigate, t }) {
  const language = t?.nav?.profile === 'الملف الشخصي' ? 'arabic'
    : t?.nav?.profile === 'Profile' ? 'english'
      : t?.nav?.profile === 'Profil' && t?.common?.back === 'Geri' ? 'turkish' : 'german'
  const localized = localizedPrivacy[language]

  if (localized) {
    return (
      <section className="screen compact-screen privacy-screen">
        <button className="back-button" onClick={() => onNavigate(backTarget)} aria-label={t.common.back}>{'<'}</button>
        <h1>{localized.title}</h1>
        {localized.sections.map(([title, text]) => (
          <article className="privacy-card" key={title}>
            <span className="settings-section-label">{title}</span>
            <p>{text}</p>
          </article>
        ))}
      </section>
    )
  }
  return (
    <section className="screen compact-screen privacy-screen">
      <button className="back-button" onClick={() => onNavigate(backTarget)} aria-label={`Zur${ue}ck`}>
        {'<'}
      </button>
      <h1>Datenschutzerkl{ae}rung</h1>

      <article className="privacy-card">
        <span className="settings-section-label">1. Verantwortlicher</span>
        <p>
          Verantwortlich f{ue}r die Datenverarbeitung im Rahmen der App MyFlow ist die
          Projektgruppe MyFlow der Hochschule Ruhr West.
        </p>
        <ul className="privacy-list">
          <li>Bayan Al Kadi</li>
          <li>Dear Arabi</li>
          <li>Selinay Barinkaya</li>
          <li>Hatice Tanribuyurdu</li>
          <li>Sura Ulgar</li>
        </ul>
        <p>
          Diese App wurde als Studienprojekt entwickelt und dient ausschlie{String.fromCharCode(223)}lich zu
          Demonstrations- und Lernzwecken.
        </p>
      </article>

      <article className="privacy-card">
        <span className="settings-section-label">2. Welche Daten werden verarbeitet?</span>
        <p>Je nach Nutzung der App k{oe}nnen folgende Daten gespeichert werden:</p>
        <ul className="privacy-list">
          <li>E-Mail-Adresse f{ue}r Registrierung und Anmeldung</li>
          <li>Name, Alter, Geschlecht, K{oe}rpergr{oe}{String.fromCharCode(223)}e und Gewicht</li>
          <li>Spracheinstellungen, Kommunikationsstil und Designeinstellungen</li>
          <li>Pers{oe}nliche Ziele, Routinen, Check-ins und Aufgaben</li>
          <li>Kalender- und Tagebucheintr{ae}ge</li>
          <li>Hochgeladene Bilder, bis zu drei Bilder pro Tag</li>
          <li>Statistische Nutzungsdaten innerhalb der App</li>
        </ul>
      </article>

      <article className="privacy-card">
        <span className="settings-section-label">3. Zweck der Verarbeitung</span>
        <p>Die erhobenen Daten werden ausschlie{String.fromCharCode(223)}lich verwendet, um:</p>
        <ul className="privacy-list">
          <li>Benutzerkonten bereitzustellen und die Anmeldung zu erm{oe}glichen</li>
          <li>pers{oe}nliche Einstellungen zu speichern</li>
          <li>Routinen und Tagesaufgaben zu verwalten</li>
          <li>Check-ins und Tagebucheintr{ae}ge zu speichern</li>
          <li>Statistiken {ue}ber pers{oe}nliche Fortschritte darzustellen</li>
          <li>die Funktionen der App bereitzustellen</li>
        </ul>
        <p>Eine Nutzung der Daten zu Werbezwecken erfolgt nicht.</p>
      </article>

      <article className="privacy-card">
        <span className="settings-section-label">4. Speicherung der Daten</span>
        <p>Die Benutzerdaten werden in einer Datenbank {ue}ber Supabase gespeichert.</p>
        <p>
          Bestimmte Einstellungen, wie beispielsweise der Hell-/Dunkelmodus oder andere
          lokale Pr{ae}ferenzen, k{oe}nnen zus{ae}tzlich im LocalStorage des jeweiligen
          Ger{ae}ts gespeichert werden.
        </p>
      </article>

      <article className="privacy-card">
        <span className="settings-section-label">5. Weitergabe von Daten</span>
        <p>
          Eine Weitergabe personenbezogener Daten an Dritte erfolgt nicht, sofern dies
          nicht gesetzlich vorgeschrieben ist oder zur Bereitstellung der technischen
          Infrastruktur erforderlich ist.
        </p>
      </article>

      <article className="privacy-card">
        <span className="settings-section-label">6. Speicherdauer</span>
        <p>
          Die Daten werden gespeichert, solange das Benutzerkonto besteht oder bis sie vom
          Nutzer gel{oe}scht werden.
        </p>
      </article>

      <article className="privacy-card">
        <span className="settings-section-label">7. Rechte der Nutzer</span>
        <p>Nutzer haben das Recht auf:</p>
        <ul className="privacy-list">
          <li>Auskunft {ue}ber ihre gespeicherten Daten</li>
          <li>Berichtigung unrichtiger Daten</li>
          <li>L{oe}schung ihrer personenbezogenen Daten</li>
          <li>Einschr{ae}nkung der Verarbeitung</li>
          <li>Widerspruch gegen die Verarbeitung, soweit gesetzlich vorgesehen</li>
        </ul>
        <button
          className="privacy-action danger"
          type="button"
          onClick={() => alert(`Account-L${oe}schung angefragt. In der finalen Version wird diese Anfrage serverseitig verarbeitet.`)}
        >
          Account-L{oe}schung anfragen
        </button>
      </article>

      <article className="privacy-card">
        <span className="settings-section-label">8. Datensicherheit</span>
        <p>
          Es werden angemessene technische und organisatorische Ma{String.fromCharCode(223)}nahmen eingesetzt,
          um personenbezogene Daten vor Verlust, Missbrauch oder unbefugtem Zugriff zu
          sch{ue}tzen.
        </p>
      </article>

      <article className="privacy-card warning">
        <span className="settings-section-label">Hinweis</span>
        <h2>Keine medizinische Beratung</h2>
        <p>
          MyFlow ersetzt keine {ae}rztliche, psychologische oder medizinische Beratung.
          Die App dient nur zur Organisation, Motivation und pers{oe}nlichen Reflexion.
        </p>
      </article>

      <article className="privacy-card">
        <span className="settings-section-label">Impressum</span>
        <h2>Projektangaben</h2>
        <p>
          MyFlow ist ein Studienprojekt der Projektgruppe MyFlow an der Hochschule Ruhr West.
          Die Kontaktdaten k{oe}nnen hier f{ue}r die finale Abgabe erg{ae}nzt werden.
        </p>
      </article>
    </section>
  )
}

export default Datenschutz
