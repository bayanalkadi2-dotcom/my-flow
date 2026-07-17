import { useEffect, useState } from 'react'
import { useAuth } from '../context/authContextValue'
import { useProfile } from '../context/profileContextValue'
import logo from '../assets/Icon Gruppe H.png'
import blueLogo from '../assets/myflow-logo-blue.png'
import iconDesign from '../assets/settings-icons/design.png'
import iconGender from '../assets/settings-icons/gender.png'
import iconHeight from '../assets/settings-icons/height.png'
import iconLanguage from '../assets/settings-icons/language.png'
import iconName from '../assets/settings-icons/name.png'
import iconReminders from '../assets/settings-icons/reminders.png'
import iconSubscription from '../assets/settings-icons/subscription.png'
import iconWeight from '../assets/settings-icons/weight.png'
import { calculateChallengePoints } from '../utils/progressLevels'
import { updateProfile, updateUserSettings, uploadProfileAvatar } from '../services/authService'
import PwaInstallOption from '../commponents/PwaInstallOption'
import AuthDesignPicker from '../commponents/AuthDesignPicker'
import {
  getHeightError,
  getProfileAgeError,
  getWeightError,
  MAX_HEIGHT_CM,
  MAX_PROFILE_AGE,
  MAX_WEIGHT_KG,
  MIN_HEIGHT_CM,
  MIN_PROFILE_AGE,
  MIN_WEIGHT_KG,
  parseHeightCm,
  parseProfileAge,
  parseWeightKg,
} from '../utils/profileValidation'

const languageOptions = [
  { id: 'german', label: 'Deutsch' },
  { id: 'english', label: 'English' },
  { id: 'turkish', label: 'Türkçe' },
  { id: 'arabic', label: 'العربية' },
]

const genderOptions = [
  { id: 'male', label: 'Männlich', name: 'Student' },
  { id: 'female', label: 'Weiblich', name: 'Studentin' },
  { id: 'diverse', label: 'Divers', name: 'Student:in' },
  { id: 'none', label: 'Keine Angabe', name: 'Student' },
]

const paymentPlans = [
  { id: 'free', label: 'Kostenlos', monthlyPrice: '0 EUR', yearlyPrice: '0 EUR' },
  { id: 'plus', label: 'Plus Tools', monthlyPrice: '4,99 EUR', yearlyPrice: '49,88 EUR' },
  { id: 'pro', label: 'Pro Tools', monthlyPrice: '9,99 EUR', yearlyPrice: '109,88 EUR' },
]

const billingCycles = ['Monatlich', 'Jährlich']

const paymentMethods = ['PayPal', 'Klarna', 'Kreditkarte', 'SEPA', 'Apple Pay', 'Google Pay']

const levelSteps = [
  { name: 'Starter', min: 0 },
  { name: 'Bronze', min: 250 },
  { name: 'Silber', min: 500 },
  { name: 'Gold', min: 800 },
  { name: 'Flow Pro', min: 1200 },
]

const treeOptions = [
  { id: 'oak', label: 'Eiche', symbol: '🌳' },
  { id: 'pine', label: 'Tanne', symbol: '🌲' },
  { id: 'flower', label: 'Blume', symbol: '🌸' },
]

function getFlowTree(score, treeType = 'oak') {
  const selectedTree = treeOptions.find((tree) => tree.id === treeType) ?? treeOptions[0]

  if (score < 100) {
    return { stage: selectedTree.label, symbol: selectedTree.symbol, progress: Math.round(score), next: 'Nächste Wachstumsstufe ab 100 Punkten', count: 1 }
  }

  if (score < 250) {
    return { stage: selectedTree.label, symbol: selectedTree.symbol, progress: Math.round(((score - 100) / 150) * 100), next: 'Nächste Wachstumsstufe ab 250 Punkten', count: 1 }
  }

  if (score < 500) {
    return { stage: selectedTree.label, symbol: selectedTree.symbol, progress: Math.round(((score - 250) / 250) * 100), next: 'Nächste Wachstumsstufe ab 500 Punkten', count: 1 }
  }

  if (score < 800) {
    return { stage: selectedTree.label, symbol: selectedTree.symbol, progress: Math.round(((score - 500) / 300) * 100), next: 'Nächste Wachstumsstufe ab 800 Punkten', count: 1 }
  }

  if (score < 1200) {
    return { stage: selectedTree.label, symbol: selectedTree.symbol, progress: Math.round(((score - 800) / 400) * 100), next: 'zweiter Baum ab 1200 Punkten', count: 1 }
  }

  return { stage: 'Flow-Wald', symbol: selectedTree.symbol, progress: 100, next: 'Maximale Stufe erreicht', count: Math.min(3, Math.floor(score / 600)) }
}

function getLevel(score) {
  const currentLevel = [...levelSteps].reverse().find((level) => score >= level.min)
  const nextLevel = levelSteps.find((level) => level.min > score)
  const currentMin = currentLevel?.min ?? 0
  const nextMin = nextLevel?.min ?? currentMin
  const progress = nextLevel
    ? Math.round(((score - currentMin) / (nextMin - currentMin)) * 100)
    : 100

  return {
    current: currentLevel?.name ?? 'Starter',
    next: nextLevel?.name ?? 'Max Level',
    nextMin,
    progress,
  }
}

function getPaymentInstruction(method, copy) {
  switch (method) {
    case 'PayPal':
      return copy.paypal
    case 'Klarna':
      return copy.klarna
    case 'Kreditkarte':
      return copy.card
    case 'SEPA':
      return copy.sepa
    case 'Apple Pay':
      return copy.apple
    case 'Google Pay':
      return copy.google
    default:
      return copy.select
  }
}

function getBmiCategory(bmi) {
  if (bmi < 18.5) {
    return 'underweight'
  }

  if (bmi < 25) {
    return 'normal'
  }

  if (bmi < 30) {
    return 'overweight'
  }

  return 'severe'
}

function getHealthRecommendation(bmi, weight) {
  const waterLiters = Math.max(1.5, Math.round(weight * 35) / 1000).toFixed(1)

  if (bmi < 18.5) {
    return { water: waterLiters, steps: '7.000', note: 'gentle' }
  }

  if (bmi < 25) {
    return { water: waterLiters, steps: '8.000', note: 'average' }
  }

  if (bmi < 30) {
    return { water: waterLiters, steps: '9.000', note: 'active' }
  }

  return { water: waterLiters, steps: '7.500', note: 'start' }
}

function SettingIcon({ type }) {
  const icons = {
    name: iconName,
    age: iconName,
    gender: iconGender,
    weight: iconWeight,
    height: iconHeight,
    reminders: iconReminders,
    language: iconLanguage,
    design: iconDesign,
    subscription: iconSubscription,
  }

  return (
    <span className="setting-row-icon" aria-hidden="true">
      {type === 'communication' ? (
        <svg className="communication-bubbles-icon" viewBox="0 0 32 32">
          <defs>
            <linearGradient id="communication-icon-gradient" x1="2" y1="5" x2="30" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ff78bd" />
              <stop offset="1" stopColor="#8d63ff" />
            </linearGradient>
          </defs>
          <path stroke="url(#communication-icon-gradient)" d="M5 7.5h13a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-6.5L7 22v-3.5H5a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3Z" />
          <path stroke="url(#communication-icon-gradient)" d="M17 13.5h10a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-2V28l-4.5-3.5H17a3 3 0 0 1-3-3v-3" />
        </svg>
      ) : (
        <img src={icons[type] ?? iconName} alt="" />
      )}
    </span>
  )
}

function Profil({
  appColor,
  appTheme,
  communicationStyle,
  languageStyle,
  profileName,
  habits = [],
  settingsPage = false,
  tone,
  t,
  onAppThemeChange,
  onAppDesignChange,
  onCommunicationStyleChange,
  onNavigate,
  onProfileNameChange,
  onSelectStyle,
}) {
  const { signout, user } = useAuth()
  const { profile, profileSituation, setProfile } = useProfile()
  const situationTranslations = {
    german: {
      user: { university: 'Student:in', school: 'Schüler:in', vocational_training: 'Auszubildende:r', dual_study: 'Dual Studierende:r', employed: 'Berufstätig', other: 'Andere' },
      education: { university: 'Universität' }, challenge: { exam_stress: 'Prüfungsstress' }, goal: { better_day_structure: 'Bessere Tagesstruktur' }, none: 'Keine Angabe',
    },
    english: {
      user: { university: 'University student', school: 'School student', vocational_training: 'Trainee', dual_study: 'Dual-study student', employed: 'Employed', other: 'Other' },
      education: { university: 'University' }, challenge: { exam_stress: 'Exam stress' }, goal: { better_day_structure: 'Better daily structure' }, none: 'Not specified',
    },
    turkish: {
      user: { university: 'Üniversite öğrencisi', school: 'Öğrenci', vocational_training: 'Mesleki eğitim öğrencisi', dual_study: 'İkili program öğrencisi', employed: 'Çalışan', other: 'Diğer' },
      education: { university: 'Üniversite' }, challenge: { exam_stress: 'Sınav stresi' }, goal: { better_day_structure: 'Daha iyi günlük düzen' }, none: 'Belirtilmedi',
    },
    arabic: {
      user: { university: 'طالبة جامعة', school: 'طالبة', vocational_training: 'متدربة مهنية', dual_study: 'طالبة دراسة مزدوجة', employed: 'موظفة', other: 'أخرى' },
      education: { university: 'جامعة' }, challenge: { exam_stress: 'التوتر من الامتحانات' }, goal: { better_day_structure: 'تنظيم اليوم بشكل أفضل' }, none: 'غير محدد',
    },
  }[languageStyle] ?? null
  const localizedSituation = situationTranslations ? {
    userType: situationTranslations.user[profile?.student_status] ?? profileSituation.userType,
    educationLevel: situationTranslations.education[profile?.education_level] ?? (profile?.education_level ? profileSituation.educationLevel : situationTranslations.none),
    challenges: profile?.main_challenges?.length ? profile.main_challenges.map((value) => situationTranslations.challenge[value] ?? value) : [situationTranslations.none],
    supportGoals: profile?.support_goals?.length ? profile.support_goals.map((value) => situationTranslations.goal[value] ?? value) : [situationTranslations.none],
  } : profileSituation
  const guestDetails = (() => {
    try {
      return JSON.parse(localStorage.getItem('myflow-guest-setup') || '{}')
    } catch {
      return {}
    }
  })()
  const storedWeight = profile?.weight_kg ?? user?.user_metadata?.weight_kg ?? guestDetails.weight_kg
  const storedHeight = profile?.height_cm ?? user?.user_metadata?.height_cm ?? guestDetails.height_cm
  const [showProfileSettings, setShowProfileSettings] = useState(false)
  const [activeEditor, setActiveEditor] = useState(null)
  const [ageError, setAgeError] = useState('')
  const [measurementErrors, setMeasurementErrors] = useState({ weight: '', height: '' })
  const [gender, setGender] = useState(profile?.gender || 'male')
  const [reminders, setReminders] = useState(() => localStorage.getItem('myflow-reminders-enabled') !== 'false')
  const [age, setAge] = useState(Number(profile?.age) || 0)
  const [weight, setWeight] = useState(Number(storedWeight) || 0)
  const [height, setHeight] = useState(Number(storedHeight) || 175)
  const [paymentPlan, setPaymentPlan] = useState('free')
  const [billingCycle, setBillingCycle] = useState('Monatlich')
  const [paymentMethod, setPaymentMethod] = useState('PayPal')
  const [paymentStatus, setPaymentStatus] = useState('Nicht gestartet')
  const [cardNumber, setCardNumber] = useState('')
  const [iban, setIban] = useState('')
  const [paymentEmail, setPaymentEmail] = useState('')
  const [treeType, setTreeType] = useState(() => localStorage.getItem('myflow-tree-type') || 'oak')
  const [profileImage, setProfileImage] = useState(() => profile?.avatar_url || localStorage.getItem('myflow-profile-image') || '')
  const [profileImageStatus, setProfileImageStatus] = useState('')
  const storedAge = parseProfileAge(profile?.age)
  const currentAge = storedAge ?? age
  const [draftSettings, setDraftSettings] = useState({
    name: profileName || 'Gast',
    gender,
    age: currentAge,
    weight,
    height,
    reminders,
    communicationStyle,
    languageStyle,
    design: appTheme,
  })

  useEffect(() => {
    const savedWeight = Number(storedWeight)
    const savedHeight = Number(storedHeight)

    if (savedWeight > 0) {
      // Keep editable measurements aligned with a profile loaded asynchronously.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWeight(savedWeight)
    }

    if (savedHeight > 0) {
      setHeight(savedHeight)
    }

    setDraftSettings((current) => ({
      ...current,
      weight: savedWeight > 0 ? savedWeight : current.weight,
      height: savedHeight > 0 ? savedHeight : current.height,
    }))
  }, [storedHeight, storedWeight])

  const selectedGender = genderOptions.find((option) => option.id === gender)
  const selectedGenderLabel = t.profile.genderOptions?.[selectedGender?.id] ?? selectedGender?.label
  const selectedPlan = paymentPlans.find((plan) => plan.id === paymentPlan)
  const paymentCopy = t.profile.paymentUi
  const paymentInstructions = t.profile.paymentInstructions
  const getPlanLabel = (plan) => plan.id === 'free' ? paymentCopy.free : plan.label
  const getCycleLabel = (cycle) => cycle === 'Jährlich' ? paymentCopy.yearly : paymentCopy.monthly
  const getPaymentMethodLabel = (method) => method === 'Kreditkarte' ? paymentCopy.card : method
  const selectedPlanPrice = billingCycle === 'Jährlich'
    ? `${selectedPlan.yearlyPrice} pro Jahr`
    : selectedPlan.monthlyPrice
  const name = profileName || 'Gast'
  const visibleProfileImage = profile?.avatar_url || profileImage
  const profileCardTitle = profile?.display_name?.trim()
    || (profileName && profileName !== 'Gast' ? profileName : '')
    || 'Dein Profil'
  const profileInitial = name.trim().charAt(0).toUpperCase() || 'G'
  const heightInMeters = height / 100
  const bmi = weight > 0 && height > 0 ? weight / (heightInMeters * heightInMeters) : 0
  const bmiLabel = bmi.toFixed(1)
  const bmiCategory = getBmiCategory(bmi)
  const healthCopy = t.profile.healthUi
  const recommendation = getHealthRecommendation(bmi, weight)
  const challengePoints = calculateChallengePoints(habits)
  const level = getLevel(challengePoints)
  const baseFlowTree = getFlowTree(challengePoints, treeType)
  const flowTreeLevel = challengePoints < 100 ? 0 : challengePoints < 250 ? 1 : challengePoints < 500 ? 2 : challengePoints < 800 ? 3 : 4
  const flowTreeStages = {
    oak: [
      ['Eiche als Samen', '🌰'],
      ['Eichenkeimling', '🌱'],
      ['Junge Eiche', '🌿'],
      ['Eiche', '🌳'],
      ['Starke Eiche', '🌳'],
    ],
    pine: [
      ['Tanne als Samen', '🌰'],
      ['Tannenkeimling', '🌱'],
      ['Junge Tanne', '🌿'],
      ['Tanne', '🌲'],
      ['Starke Tanne', '🌲'],
    ],
    flower: [
      ['Blumensamen', '🌰'],
      ['Blumenkeimling', '🌱'],
      ['Knospe', '🌷'],
      ['Blume', '🌸'],
      ['Blühende FlowFlower', '🌺'],
    ],
  }
  const selectedFlowTreeStages = flowTreeStages[treeType] ?? flowTreeStages.oak
  const flowTree = {
    ...baseFlowTree,
    productName: treeType === 'flower' ? 'FlowFlower' : 'FlowTree',
    stage: selectedFlowTreeStages[flowTreeLevel][0],
    symbol: selectedFlowTreeStages[flowTreeLevel][1],
  }
  const showSettings = settingsPage || showProfileSettings

  function selectTreeType(nextTreeType) {
    setTreeType(nextTreeType)
    localStorage.setItem('myflow-tree-type', nextTreeType)
    if (user?.id) {
      updateUserSettings(user.id, { tree_type: nextTreeType }).then((result) => {
        if (!result.success) console.error('Baumart konnte nicht gespeichert werden:', result.error)
      })
    }
  }

  async function savePersonalDetails(updates) {
    if (!profile?.id) return
    const result = await updateProfile(profile.id, updates)
    if (result.success) {
      setProfile((current) => ({ ...current, ...updates, ...(result.profile ?? {}) }))
    } else {
      console.error('Profilangabe konnte nicht gespeichert werden:', result.error)
    }
  }

  function openEditor(editor) {
    setAgeError('')
    setMeasurementErrors({ weight: '', height: '' })
    if (activeEditor === editor) {
      setActiveEditor(null)
      return
    }

    setDraftSettings({
      name,
      gender,
      age: currentAge,
      weight,
      height,
      reminders,
      communicationStyle,
      languageStyle,
      design: appTheme,
    })
    setActiveEditor(editor)
  }

  function updateDraft(key, value) {
    if (key === 'age') setAgeError('')
    if (key === 'weight' || key === 'height') {
      setMeasurementErrors((current) => ({ ...current, [key]: '' }))
    }
    setDraftSettings((currentDraft) => ({
      ...currentDraft,
      [key]: value,
    }))
  }

  function selectDesign(color, mode) {
    updateDraft('design', mode)
    onAppDesignChange(color, mode)
    setActiveEditor(null)
  }

  function confirmEditor() {
    switch (activeEditor) {
      case 'name':
        onProfileNameChange(draftSettings.name)
        break
      case 'gender':
        setGender(draftSettings.gender)
        savePersonalDetails({ gender: draftSettings.gender })
        break
      case 'age': {
        const nextAge = parseProfileAge(draftSettings.age)
        if (nextAge === null) {
          setAgeError(getProfileAgeError(draftSettings.age))
          return
        }
        setAge(nextAge)
        savePersonalDetails({ age: nextAge })
        break
      }
      case 'weight': {
        if (draftSettings.weight === '' || draftSettings.weight === null || draftSettings.weight === undefined) {
          setWeight(0)
          savePersonalDetails({ weight_kg: null })
          break
        }
        const nextWeight = parseWeightKg(draftSettings.weight)
        if (nextWeight === null) {
          setMeasurementErrors((current) => ({ ...current, weight: getWeightError(draftSettings.weight) }))
          return
        }
        setWeight(nextWeight)
        savePersonalDetails({ weight_kg: nextWeight })
        break
      }
      case 'height': {
        const nextHeight = parseHeightCm(draftSettings.height)
        if (nextHeight === null) {
          setMeasurementErrors((current) => ({ ...current, height: getHeightError(draftSettings.height) }))
          return
        }
        setHeight(nextHeight)
        savePersonalDetails({ height_cm: nextHeight })
        break
      }
      case 'reminders':
        setReminders(draftSettings.reminders)
        localStorage.setItem('myflow-reminders-enabled', String(draftSettings.reminders))
        if (user?.id) updateUserSettings(user.id, { notifications_enabled: draftSettings.reminders })
        break
      case 'language':
        onSelectStyle(draftSettings.languageStyle)
        break
      case 'communicationStyle':
        onCommunicationStyleChange(draftSettings.communicationStyle)
        break
      case 'design':
        onAppThemeChange(draftSettings.design)
        break
      default:
        break
    }

    setActiveEditor(null)
  }

  function handlePaymentSubmit() {
    if (paymentPlan === 'free') {
      setPaymentStatus('Kostenloser Plan aktiv')
      return
    }

    setPaymentStatus(`${selectedPlan.label}: ${selectedPlanPrice} mit ${paymentMethod} aktiviert`)
  }

  async function handleProfileImageChange(event) {
    const file = event.target.files?.[0]

    if (!file || !user?.id) return
    setProfileImageStatus('Profilbild wird gespeichert …')
    const result = await uploadProfileAvatar(user.id, file)
    event.target.value = ''
    if (!result.success) {
      setProfileImageStatus(result.error)
      return
    }
    setProfileImage(result.avatarUrl)
    setProfile((current) => ({ ...current, avatar_url: result.avatarUrl }))
    localStorage.setItem('myflow-profile-image', result.avatarUrl)
    setProfileImageStatus('Profilbild wurde gespeichert.')
  }

  return (
    <section className={`screen compact-screen profile-screen ${settingsPage ? 'profile-settings-screen' : ''}`}>
      {settingsPage && (
        <header className="profile-settings-page-header">
          <button className="back-button" onClick={() => onNavigate('profile')} aria-label={t.common.back}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m14.5 5-7 7 7 7" />
            </svg>
          </button>
          <div>
            <h1>{t.profile.settings.replace('Profil-', '')}</h1>
            <p>{t.profile.settingsText}</p>
          </div>
        </header>
      )}
      {!settingsPage ? (
        <div className="profile-title-row">
          <img src={appColor === 'Blau' ? blueLogo : logo} alt="MyFlow Logo" className="small-logo" />
          <h1>{t.profile.title}</h1>
        </div>
      ) : null}
      <button
        className="settings-gear-button"
        style={{ display: settingsPage ? 'none' : undefined }}
        onClick={() => onNavigate('profileSettings')}
        type="button"
        aria-label={t.profile.openSettings}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
          <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.2a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3 1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.2a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8 1.6 1.6 0 0 0 1.5 1h.2a2 2 0 0 1 0 4h-.2a1.6 1.6 0 0 0-1.5 1Z" />
        </svg>
      </button>
      <input
        id="profile-image-input"
        className="profile-image-input"
        type="file"
        accept="image/*"
        onChange={handleProfileImageChange}
      />
      <div className="profile-picture-card">
        <label className="profile-picture" htmlFor="profile-image-input" aria-label={t.profile.changePicture}>
          {visibleProfileImage ? <img src={visibleProfileImage} alt="" /> : profileInitial}
        </label>
        <div>
          <strong>{name}</strong>
          <p>{t.profile.picture}</p>
          <label className="profile-picture-button" htmlFor="profile-image-input">{t.profile.changePicture}</label>
        </div>
      </div>
      {profileImageStatus && <p className="profile-image-status" role="status">{profileImageStatus}</p>}
      {!settingsPage && (
        <section className="profile-situation-card" aria-labelledby="profile-situation-title">
          <div className="profile-situation-header">
            <div>
              <p className="eyebrow">{t.profile.personalization}</p>
              <h2 id="profile-situation-title">{t.profile.situation}</h2>
            </div>
            <button type="button" onClick={() => onNavigate('profileOnboarding')}>{t.profile.editDetails}</button>
          </div>
          <dl className="profile-situation-list">
            <div>
              <dt>{t.profile.userType}</dt>
              <dd>{localizedSituation.userType}</dd>
            </div>
            <div>
              <dt>{t.profile.educationLevel}</dt>
              <dd>{localizedSituation.educationLevel}</dd>
            </div>
            <div>
              <dt>{t.profile.challenges}</dt>
              <dd>{localizedSituation.challenges.join(', ')}</dd>
            </div>
            <div>
              <dt>{t.profile.supportGoals}</dt>
              <dd>{localizedSituation.supportGoals.join(', ')}</dd>
            </div>
          </dl>
        </section>
      )}
      {showSettings && (
        <section className="register-settings-panel profile-settings-panel" aria-label={t.profile.settings}>
          <div className="register-settings-header">
            <div>
              <strong>{t.profile.settings}</strong>
              <p>{t.profile.settingsText}</p>
            </div>
            <button type="button" onClick={() => settingsPage ? onNavigate('profile') : setShowProfileSettings(false)} aria-label={t.profile.closeSettings}>
              x
            </button>
          </div>
          <div className="profile-edit-panel">
            <label className="settings-profile-avatar" htmlFor="profile-image-input" aria-label={t.profile.changePicture}>
              {visibleProfileImage ? <img src={visibleProfileImage} alt="" /> : profileInitial}
            </label>
            <strong>{profileCardTitle}</strong>
            <p>{t.profile.overviewText}</p>
          </div>
          <div className="settings-list">
        <span className="settings-section-label">{t.profile.profileSection}</span>
        <div className="profile-setting-row">
          <SettingIcon type="name" />
          <span>{t.profile.name}</span>
          <strong>{name}</strong>
          <button type="button" onClick={() => openEditor('name')}>{t.common.change}</button>
        </div>
        {activeEditor === 'name' && (
          <div className="profile-edit-panel">
            <label>
              {t.profile.newName}
              <input value={draftSettings.name} onChange={(event) => updateDraft('name', event.target.value)} />
            </label>
            <button className="profile-confirm-button" type="button" onClick={confirmEditor}>OK</button>
          </div>
        )}

        <div className="profile-setting-row">
          <SettingIcon type="gender" />
          <span>{t.profile.gender}</span>
          <strong>{selectedGenderLabel}</strong>
          <button type="button" onClick={() => openEditor('gender')}>{t.common.change}</button>
        </div>
        {activeEditor === 'gender' && (
          <div className="profile-edit-panel">
            <div className="option-grid">
              {genderOptions.map((option) => (
                <button
                  className={`profile-choice ${draftSettings.gender === option.id ? 'selected' : ''}`}
                  key={option.id}
                  onClick={() => updateDraft('gender', option.id)}
                  type="button"
                >
                  {t.profile.genderOptions?.[option.id] ?? option.label}
                </button>
              ))}
            </div>
            <button className="profile-confirm-button" type="button" onClick={confirmEditor}>OK</button>
          </div>
        )}

        <div className="profile-setting-row">
          <SettingIcon type="age" />
          <span>{t.profile.age}</span>
          <strong>{currentAge ? `${currentAge} ${t.profile.years}` : t.profile.noValue}</strong>
          <button type="button" onClick={() => openEditor('age')}>{t.common.change}</button>
        </div>
        {activeEditor === 'age' && (
          <div className="profile-edit-panel">
            <label>
              {t.profile.ageInYears}
              <input
                inputMode="numeric"
                min={MIN_PROFILE_AGE}
                max={MAX_PROFILE_AGE}
                className={ageError ? 'field-invalid' : ''}
                step="1"
                type="number"
                value={draftSettings.age}
                onChange={(event) => updateDraft('age', event.target.value)}
                onBlur={() => setAgeError(getProfileAgeError(draftSettings.age))}
              />
            </label>
            {ageError && <p className="student-onboarding-error" role="alert">{ageError}</p>}
            <button className="profile-confirm-button" type="button" onClick={confirmEditor} disabled={parseProfileAge(draftSettings.age) === null}>OK</button>
          </div>
        )}

        <div className="profile-setting-row">
          <SettingIcon type="weight" />
          <span>{t.profile.weight}</span>
          <strong>{weight ? `${weight} kg` : t.profile.noValue}</strong>
          <button type="button" onClick={() => openEditor('weight')}>{t.common.change}</button>
        </div>
        {activeEditor === 'weight' && (
          <div className="profile-edit-panel">
            <label>
              {t.profile.weightInKg}
              <input
                className={measurementErrors.weight ? 'field-invalid' : ''}
                inputMode="decimal"
                min={MIN_WEIGHT_KG}
                max={MAX_WEIGHT_KG}
                step="0.1"
                type="text"
                value={draftSettings.weight}
                onChange={(event) => updateDraft('weight', event.target.value)}
                onBlur={() => setMeasurementErrors((current) => ({
                  ...current,
                  weight: draftSettings.weight ? getWeightError(draftSettings.weight) : '',
                }))}
              />
            </label>
            {measurementErrors.weight && <p className="student-onboarding-error" role="alert">{measurementErrors.weight}</p>}
            {!draftSettings.weight && (
              <p className="student-onboarding-note">
                Ohne Gewichtsangabe können manche Funktionen der App nicht genutzt werden.
              </p>
            )}
            <button className="profile-confirm-button" type="button" onClick={confirmEditor} disabled={Boolean(draftSettings.weight) && parseWeightKg(draftSettings.weight) === null}>OK</button>
          </div>
        )}

        <div className="profile-setting-row">
          <SettingIcon type="height" />
          <span>{t.profile.height}</span>
          <strong>{height} cm</strong>
          <button type="button" onClick={() => openEditor('height')}>{t.common.change}</button>
        </div>
        {activeEditor === 'height' && (
          <div className="profile-edit-panel">
            <label>
              {t.profile.heightInCm}
              <input
                className={measurementErrors.height ? 'field-invalid' : ''}
                inputMode="decimal"
                min={MIN_HEIGHT_CM}
                max={MAX_HEIGHT_CM}
                step="0.1"
                type="text"
                value={draftSettings.height}
                onChange={(event) => updateDraft('height', event.target.value)}
                onBlur={() => setMeasurementErrors((current) => ({ ...current, height: getHeightError(draftSettings.height) }))}
              />
            </label>
            {measurementErrors.height && <p className="student-onboarding-error" role="alert">{measurementErrors.height}</p>}
            <button className="profile-confirm-button" type="button" onClick={confirmEditor} disabled={parseHeightCm(draftSettings.height) === null}>OK</button>
          </div>
        )}

        <div className="profile-setting-row">
          <SettingIcon type="reminders" />
          <span>{t.profile.reminders}</span>
          <strong>{reminders ? t.common.active : t.common.off}</strong>
          <button type="button" onClick={() => openEditor('reminders')}>{t.common.change}</button>
        </div>
        {activeEditor === 'reminders' && (
          <div className="profile-edit-panel">
            <div className="option-grid">
              <button
                className={`profile-choice ${draftSettings.reminders ? 'selected' : ''}`}
                onClick={() => updateDraft('reminders', true)}
                type="button"
              >
                {t.common.active}
              </button>
              <button
                className={`profile-choice ${!draftSettings.reminders ? 'selected' : ''}`}
                onClick={() => updateDraft('reminders', false)}
                type="button"
              >
                {t.common.off}
              </button>
            </div>
            <button className="profile-confirm-button" type="button" onClick={confirmEditor}>OK</button>
          </div>
        )}

        <div className="profile-setting-row">
          <SettingIcon type="onboarding" />
          <span>{t.profile.situation}</span>
          <strong>{t.profile.details}</strong>
          <button type="button" onClick={() => onNavigate('profileOnboarding')}>{t.profile.editDetails}</button>
        </div>

        <span className="settings-section-label">{t.profile.settingsSection}</span>
        <PwaInstallOption />
        <div className="profile-setting-row">
          <SettingIcon type="language" />
          <span>{t.profile.language}</span>
          <strong>{tone.label}</strong>
          <button type="button" onClick={() => openEditor('language')}>{t.common.change}</button>
        </div>
        {activeEditor === 'language' && (
          <div className="profile-edit-panel language-settings-options">
            <div className="option-grid">
              {languageOptions.map((option) => (
                <button
                  className={`profile-choice ${draftSettings.languageStyle === option.id ? 'selected' : ''}`}
                  key={option.id}
                  onClick={() => updateDraft('languageStyle', option.id)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button className="profile-confirm-button" type="button" onClick={confirmEditor}>OK</button>
          </div>
        )}

        <div className="profile-setting-row">
          <SettingIcon type="communication" />
          <span>{t.profile.communicationStyle}</span>
          <strong>{t.language.toneOptions[communicationStyle].title}</strong>
          <button type="button" onClick={() => openEditor('communicationStyle')}>{t.common.change}</button>
        </div>
        {activeEditor === 'communicationStyle' && (
          <div className="profile-edit-panel">
            <div className="option-grid">
              {Object.entries(t.language.toneOptions).map(([id, option]) => (
                <button
                  className={`profile-choice ${draftSettings.communicationStyle === id ? 'selected' : ''}`}
                  key={id}
                  onClick={() => updateDraft('communicationStyle', id)}
                  type="button"
                >
                  {option.title}
                </button>
              ))}
            </div>
            <button className="profile-confirm-button" type="button" onClick={confirmEditor}>OK</button>
          </div>
        )}

        <div className="profile-setting-row">
          <SettingIcon type="design" />
          <span>{t.profile.design}</span>
          <strong>{appColor === 'Blau' ? t.profile.designPicker.blue : t.profile.designPicker.purple} · {appTheme === 'Dunkel' ? t.profile.designPicker.dark : t.profile.designPicker.light}</strong>
          <button type="button" onClick={() => openEditor('design')}>{t.common.change}</button>
        </div>
        {activeEditor === 'design' && (
          <div className="profile-edit-panel">
            <AuthDesignPicker color={appColor} mode={appTheme} onChange={selectDesign} t={t} />
          </div>
        )}
        <div className="profile-setting-row">
          <SettingIcon type="privacy" />
          <span>{t.profile.privacy}</span>
          <strong>{t.profile.info}</strong>
          <button type="button" onClick={() => onNavigate('privacy')}>{t.profile.open}</button>
        </div>
        <div className="profile-setting-row">
          <SettingIcon type="subscription" />
          <span>{t.profile.subscription}</span>
          <strong>{getPlanLabel(selectedPlan)}</strong>
          <button type="button" onClick={() => openEditor('payment')}>{t.common.change}</button>
        </div>
        {activeEditor === 'payment' && (
          <div className="settings-group payment-settings">
            <div className="payment-settings-title">
              <strong>{t.profile.payment}</strong>
              <span>{getPlanLabel(selectedPlan)} / {selectedPlanPrice}</span>
            </div>
            <div className="paid-tools-list">
              {[paymentCopy.coach, paymentCopy.stats, paymentCopy.routines].map((tool) => <span key={tool}>{tool}</span>)}
            </div>
            <div className="payment-method-grid">
              {billingCycles.map((cycle) => (
                <button
                  className={`payment-method ${billingCycle === cycle ? 'selected' : ''}`}
                  key={cycle}
                  onClick={() => {
                    setBillingCycle(cycle)
                    setPaymentStatus('Nicht gestartet')
                  }}
                  type="button"
                >
                  {getCycleLabel(cycle)}
                </button>
              ))}
            </div>
            <div className="payment-plan-grid">
              {paymentPlans.map((plan) => (
                <button
                  className={`payment-option ${paymentPlan === plan.id ? 'selected' : ''}`}
                  key={plan.id}
                  onClick={() => {
                    setPaymentPlan(plan.id)
                    setPaymentStatus('Nicht gestartet')
                  }}
                  type="button"
                >
                  <span>{getPlanLabel(plan)}</span>
                  <strong>
                    {billingCycle === 'Jährlich' ? `${plan.yearlyPrice} pro Jahr` : plan.monthlyPrice}
                  </strong>
                </button>
              ))}
            </div>
            <p>{t.profile.paidText}</p>
            <div className="payment-method-grid">
              {paymentMethods.map((method) => (
                <button
                  className={`payment-method ${paymentMethod === method ? 'selected' : ''}`}
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  type="button"
                >
                  {getPaymentMethodLabel(method)}
                </button>
              ))}
            </div>
            <div className="payment-checkout">
              <div>
                <span>{paymentCopy.execute}</span>
                <strong>{paymentStatus === 'Nicht gestartet' ? paymentCopy.notStarted : paymentStatus}</strong>
                <p>{getPaymentInstruction(paymentMethod, paymentInstructions)}</p>
              </div>
              {['PayPal', 'Klarna'].includes(paymentMethod) && (
                <label>
                  {paymentCopy.email}
                  <input
                    type="email"
                    value={paymentEmail}
                    onChange={(event) => setPaymentEmail(event.target.value)}
                    placeholder="name@beispiel.de"
                  />
                </label>
              )}
              {paymentMethod === 'Kreditkarte' && (
                <label>
                  {paymentInstructions.cardNumber}
                  <input
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(event) => setCardNumber(event.target.value)}
                    placeholder="1234 5678 9012 3456"
                  />
                </label>
              )}
              {paymentMethod === 'SEPA' && (
                <label>
                  IBAN
                  <input
                    value={iban}
                    onChange={(event) => setIban(event.target.value)}
                    placeholder="DE00 0000 0000 0000 0000 00"
                  />
                </label>
              )}
              {['Apple Pay', 'Google Pay'].includes(paymentMethod) && (
                <p className="wallet-note">{paymentInstructions.wallet}</p>
              )}
              <button className="payment-submit" type="button" onClick={handlePaymentSubmit}>
                {paymentPlan === 'free' ? paymentCopy.activateFree : paymentCopy.confirm}
              </button>
            </div>
          </div>
        )}
          </div>
        </section>
      )}
      <div className="bmi-card">
        <div>
          <span>BMI</span>
          <strong>{bmiLabel}</strong>
          <p>{healthCopy[bmiCategory]}</p>
        </div>
        <div>
          <span>{t.profile.water}</span>
          <strong>{recommendation.water} L</strong>
          <p>{t.profile.perDay}</p>
        </div>
        <div>
          <span>{healthCopy.steps}</span>
          <strong>{recommendation.steps}</strong>
          <p>{healthCopy[recommendation.note]}</p>
        </div>
      </div>
      <div className="profile-level-card">
        <div>
          <span>{t.profile.challengeLevel}</span>
          <h2>{level.current}</h2>
          <p>{t.profile.points.replace('{points}', challengePoints)}</p>
        </div>
        <strong>{level.progress}%</strong>
        <div className="profile-level-progress">
          <span style={{ width: `${level.progress}%` }} />
        </div>
        <small>{t.profile.nextLevel.replace('{level}', level.next).replace('{points}', level.nextMin)}</small>
      </div>
      <div className="flow-tree-card">
        <div className="flow-tree-visual" aria-label={`${flowTree.productName} Stufe ${flowTree.stage}`}>
          {Array.from({ length: flowTree.count }).map((_, index) => (
            <span key={index}>{flowTree.symbol}</span>
          ))}
        </div>
        <div className="flow-tree-info">
          <span>{flowTree.productName}</span>
          <h2>{healthCopy.treeNames[treeType]}</h2>
          <p>{healthCopy.nextStage}</p>
        </div>
        <div className="flow-tree-progress">
          <span style={{ width: `${flowTree.progress}%` }} />
        </div>
        <small>{flowTree.progress}% {healthCopy.growth}</small>
        <div className="tree-choice-row">
          {treeOptions.map((tree) => (
            <button
              className={treeType === tree.id ? 'selected' : ''}
              key={tree.id}
              onClick={() => selectTreeType(tree.id)}
              type="button"
            >
              <span>{tree.symbol}</span>
              {healthCopy.treeNames[tree.id]}
            </button>
          ))}
        </div>
      </div>
      {showSettings && (
        <button
          className="profile-logout-button"
          onClick={async () => {
            try {
              await signout()
              // App.jsx will automatically navigate to login screen after auth state changes
            } catch (err) {
              console.error('Logout error:', err)
              alert('Abmeldung fehlgeschlagen')
            }
          }}
        >
          {t.profile.logout}
        </button>
      )}
    </section>
  )
}

export default Profil
