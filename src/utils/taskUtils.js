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
  if (/doctor|dentist|medicine|health|gym|workout|hospital|clinic|physio|tablet|vitamin|checkup|check-up/.test(t))
    return 'Health';
  if (/course|learn|study|read|book|module|class|tutorial|udemy|coursera|lecture/.test(t))
    return 'Course';
  if (/pay|bill|tax|bank|invoice|finance|rent|emi|transfer|recharge/.test(t))
    return 'Finance';
  return 'Personal';
}
