// Organizer space: lets the WEI board add events to the programme.
// Only reachable by organizers (see the guard in _layout.tsx).
import { Text } from "react-native";
import { Card, Screen, SectionTitle } from "@/components/Screen";
import { useT } from "@/i18n";

export default function OrganizerScreen() {
    const t = useT();

    return (
    <Screen>
        <SectionTitle>{t.organizer.newEvent}</SectionTitle>
        <Card>
        <Text>{t.common.comingSoon}</Text>
        </Card>
    </Screen>
    );
}