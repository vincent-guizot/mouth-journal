import { Redirect } from 'expo-router';

/**
 * The tab bar's (+) button pushes /journals/create. This tab route only exists so the
 * Tabs navigator has a slot; it forwards to the single journal-create flow.
 */
export default function AddTabRoute() {
  return <Redirect href="/journals/create" />;
}
