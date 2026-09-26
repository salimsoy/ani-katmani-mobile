import { Fragment } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';

type Step = { label: string; done: boolean };

interface StepperProps {
  steps: Step[];
}

export default function Stepper({ steps }: StepperProps) {
  return (
    <View style={styles.container}>
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        const connectorLit = !isLast && steps[idx + 1].done;
        return (
          <Fragment key={step.label}>
            <View style={styles.stepColumn}>
              <View style={[styles.circle, step.done && styles.circleDone]}>
                {step.done ? (
                  <Check size={11} color="#fff" />
                ) : (
                  <Text style={styles.circleIndexText}>{idx + 1}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]} numberOfLines={2}>
                {step.label}
              </Text>
            </View>
            {!isLast && <View style={[styles.connector, connectorLit && styles.connectorLit]} />}
          </Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-start' },
  stepColumn: { alignItems: 'center', width: 60 },
  circle: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center',
  },
  circleDone: { backgroundColor: '#ff6600' },
  circleIndexText: { fontSize: 10, fontWeight: '700', color: '#999' },
  stepLabel: { fontSize: 10, fontWeight: '600', color: '#999', textAlign: 'center', marginTop: 4 },
  stepLabelDone: { color: '#1a1a1a' },
  connector: { flex: 1, height: 2, backgroundColor: '#eee', marginTop: 11 },
  connectorLit: { backgroundColor: '#ff6600' },
});
