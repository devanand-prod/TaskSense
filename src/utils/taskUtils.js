export function generateId() {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function inferCat(text) {
  const t = text.toLowerCase();
  if (/call|email|meet|report|client|project|deck|review|slack|present|standup|sprint/.test(t))
    return 'Work';
  if (/buy|order|shop|amazon|flipkart|gift|purchase|get me|pick up/.test(t))
    return 'Shopping';
  if (/groceri|milk|veget|onion|bread|rice|dal|curd|eggs|paneer|sabzi|atta|oil/.test(t))
    return 'Grocery';
  if (/doctor|dentist|medicine|health|gym|workout|hospital|clinic|physio|tablet/.test(t))
    return 'Health';
  if (/course|learn|study|read|book|module|class|tutorial|udemy|coursera|lecture/.test(t))
    return 'Course';
  if (/pay|bill|tax|bank|invoice|finance|rent|emi|transfer|recharge/.test(t))
    return 'Finance';
  return 'Personal';
}

export function inferDate(text) {
  const t = text.toLowerCase();
  if (/\btomo(rrow)?\b|\btmrw\b|\btmlw\b/.test(t))
    return { label: 'Tomorrow',  when: 'upcoming', defRem: 'Tomorrow 9:00 AM' };
  if (/\btonight\b/.test(t))
    return { label: 'Today',     when: 'today',    defRem: 'Tonight 8:00 PM' };
  if (/\btoday\b|\bnow\b|\basap\b/.test(t))
    return { label: 'Today',     when: 'today',    defRem: 'Today 6:00 PM' };
  if (/\bthis eve\b|\bafternoon\b/.test(t))
    return { label: 'Today',     when: 'today',    defRem: 'Today 5:00 PM' };
  if (/\bnext week\b|\bnxt wk\b/.test(t))
    return { label: 'Next week', when: 'upcoming', defRem: 'Monday 9:00 AM' };
  if (/\bthis week\b/.test(t))
    return { label: 'This week', when: 'upcoming', defRem: 'Friday 6:00 PM' };
  if (/\bmonday\b|\bmon\b/.test(t))
    return { label: 'Monday',    when: 'upcoming', defRem: 'Monday 9:00 AM' };
  if (/\bfriday\b|\bfri\b/.test(t))
    return { label: 'Friday',    when: 'upcoming', defRem: 'Friday 9:00 AM' };
  if (/\bweekend\b/.test(t))
    return { label: 'Weekend',   when: 'upcoming', defRem: 'Saturday 10:00 AM' };
  return   { label: 'Today',     when: 'today',    defRem: 'Today 6:00 PM' };
}
