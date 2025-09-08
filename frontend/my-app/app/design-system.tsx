import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Switch } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import components
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedCard } from '@/components/ThemedCard';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Spacing } from '@/constants/Spacing';
import { Card, TouchableCard } from '@/components/Card';

export default function DesignSystemScreen() {
  const colorScheme = useColorScheme() || 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  
  const [switchValue, setSwitchValue] = useState(false);
  const [inputText, setInputText] = useState('');
  const [passwordText, setPasswordText] = useState('');
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <ThemedText variant="h1">Design System</ThemedText>
        <ThemedText variant="bodyMediumSecondary" style={{ marginBottom: Spacing.xl }}>
          Fraud Shield UI Components
        </ThemedText>

        {/* Typography Section */}
        <ThemedView
          style={styles.section}
          lightBorderColor="#eee"
          darkBorderColor="#333"
          padding={Spacing.lg}
        >
          <ThemedText variant="h2" style={{ marginBottom: Spacing.md }}>Typography</ThemedText>

          <ThemedText variant="display" style={{ marginBottom: Spacing.sm }}>Display</ThemedText>
          <ThemedText variant="h1" style={{ marginBottom: Spacing.sm }}>Heading 1</ThemedText>
          <ThemedText variant="h2" style={{ marginBottom: Spacing.sm }}>Heading 2</ThemedText>
          <ThemedText variant="h3" style={{ marginBottom: Spacing.sm }}>Heading 3</ThemedText>
          <ThemedText variant="h4" style={{ marginBottom: Spacing.sm }}>Heading 4</ThemedText>
          <ThemedText variant="h5" style={{ marginBottom: Spacing.sm }}>Heading 5</ThemedText>
          <ThemedText variant="h6" style={{ marginBottom: Spacing.md }}>Heading 6</ThemedText>

          <ThemedText variant="bodyLarge" style={{ marginBottom: Spacing.sm }}>Body Large: The quick brown fox jumps over the lazy dog.</ThemedText>
          <ThemedText variant="bodyMedium" style={{ marginBottom: Spacing.sm }}>Body Medium: The quick brown fox jumps over the lazy dog.</ThemedText>
          <ThemedText variant="bodySmall" style={{ marginBottom: Spacing.md }}>Body Small: The quick brown fox jumps over the lazy dog.</ThemedText>
          
          <ThemedText variant="bodyMedium" weight="medium" style={{ marginBottom: Spacing.sm }}>Medium weight text</ThemedText>
          <ThemedText variant="bodyMedium" weight="semibold" style={{ marginBottom: Spacing.sm }}>Semibold weight text</ThemedText>
          <ThemedText variant="bodyMedium" weight="bold" style={{ marginBottom: Spacing.sm }}>Bold weight text</ThemedText>
          
          <ThemedText variant="caption" style={{ marginBottom: Spacing.sm }}>Caption text for smaller details</ThemedText>
          <ThemedText variant="label" style={{ marginBottom: Spacing.sm }}>Label text for form fields</ThemedText>
        </ThemedView>

        {/* Buttons Section */}
        <ThemedView 
          style={styles.section}
          lightBorderColor="#eee"
          darkBorderColor="#333"
          padding={Spacing.lg}
        >
          <ThemedText variant="h2" style={{ marginBottom: Spacing.md }}>Buttons</ThemedText>

          <View style={styles.demoRow}>
            <ThemedText variant="h5" style={{ marginBottom: Spacing.md }}>Button Variants</ThemedText>
          </View>
          
          <View style={styles.demoRow}>
            <Button title="Primary" variant="primary" style={styles.demoItem} />
            <Button title="Secondary" variant="secondary" style={styles.demoItem} />
            <Button title="Outline" variant="outline" style={styles.demoItem} />
          </View>
          
          <View style={styles.demoRow}>
            <Button title="Ghost" variant="ghost" style={styles.demoItem} />
            <Button title="Danger" variant="danger" style={styles.demoItem} />
            <Button title="Disabled" disabled style={styles.demoItem} />
          </View>
          
          <View style={styles.demoRow}>
            <ThemedText variant="h5" style={{ marginTop: Spacing.lg, marginBottom: Spacing.md }}>Button Sizes</ThemedText>
          </View>
          
          <View style={styles.demoRow}>
            <Button title="Small" size="small" style={styles.demoItem} />
            <Button title="Medium" size="medium" style={styles.demoItem} />
            <Button title="Large" size="large" style={styles.demoItem} />
          </View>
          
          <View style={styles.demoRow}>
            <ThemedText variant="h5" style={{ marginTop: Spacing.lg, marginBottom: Spacing.md }}>Button with icons</ThemedText>
          </View>
          
          <View style={styles.demoRow}>
            <Button 
              title="Left Icon" 
              leftIcon={<MaterialIcons name="check-circle" size={20} color="white" />} 
              style={styles.demoItem} 
            />
            <Button 
              title="Right Icon" 
              rightIcon={<MaterialIcons name="arrow-forward" size={20} color="white" />} 
              style={styles.demoItem} 
            />
            <Button 
              title="Loading" 
              loading 
              style={styles.demoItem} 
            />
          </View>
          
          <View style={styles.demoRow}>
            <ThemedText variant="h5" style={{ marginTop: Spacing.lg, marginBottom: Spacing.md }}>Full Width Button</ThemedText>
          </View>
          
          <Button title="Full Width Button" fullWidth />
        </ThemedView>

        {/* Cards Section */}
        <ThemedView 
          style={styles.section}
          lightBorderColor="#eee"
          darkBorderColor="#333"
          padding={Spacing.lg}
        >
          <ThemedText variant="h2" style={{ marginBottom: Spacing.md }}>Cards</ThemedText>

          <Card variant="elevated" style={{ marginBottom: Spacing.md }}>
            <ThemedText variant="h4" style={{ marginBottom: Spacing.sm }}>Elevated Card</ThemedText>
            <ThemedText variant="bodyMedium">Cards can contain various content like text, images, and actions.</ThemedText>
          </Card>

          <Card variant="flat" style={{ marginBottom: Spacing.md }}>
            <ThemedText variant="h4" style={{ marginBottom: Spacing.sm }}>Flat Card</ThemedText>
            <ThemedText variant="bodyMedium">A flat card without elevation.</ThemedText>
          </Card>

          <Card variant="outlined" style={{ marginBottom: Spacing.md }}>
            <ThemedText variant="h4" style={{ marginBottom: Spacing.sm }}>Outlined Card</ThemedText>
            <ThemedText variant="bodyMedium">An outlined card with a border.</ThemedText>
          </Card>

          <TouchableCard 
            variant="elevated" 
            onPress={() => alert('Card pressed')}
            style={{ marginBottom: Spacing.md }}
          >
            <ThemedText variant="h4" style={{ marginBottom: Spacing.sm }}>Touchable Card</ThemedText>
            <ThemedText variant="bodyMedium">This entire card is touchable. Try pressing it!</ThemedText>
          </TouchableCard>
        </ThemedView>
        
        {/* Input Fields Section */}
        <ThemedView 
          style={styles.section}
          lightBorderColor="#eee"
          darkBorderColor="#333"
          padding={Spacing.lg}
        >
          <ThemedText variant="h2" style={{ marginBottom: Spacing.md }}>Input Fields</ThemedText>
          
          <ThemedText variant="h5" style={{ marginBottom: Spacing.md }}>Text Input Variants</ThemedText>
          
          <Input
            label="Outlined Input"
            variant="outlined"
            placeholder="Enter text here"
            value={inputText}
            onChangeText={setInputText}
            containerStyle={{ marginBottom: Spacing.md }}
          />
          
          <Input
            label="Filled Input"
            variant="filled"
            placeholder="Enter text here"
            value={inputText}
            onChangeText={setInputText}
            containerStyle={{ marginBottom: Spacing.md }}
          />
          
          <Input
            label="Underlined Input"
            variant="underlined"
            placeholder="Enter text here"
            value={inputText}
            onChangeText={setInputText}
            containerStyle={{ marginBottom: Spacing.md }}
          />
          
          <Input
            label="Password Input"
            variant="outlined"
            placeholder="Enter password"
            secureTextEntry
            secureToggle
            value={passwordText}
            onChangeText={setPasswordText}
            containerStyle={{ marginBottom: Spacing.md }}
          />
          
          <Input
            label="Input with Icon"
            variant="outlined"
            placeholder="Search..."
            leftIcon={<MaterialIcons name="search" size={24} color={tintColor} />}
            value={inputText}
            onChangeText={setInputText}
            containerStyle={{ marginBottom: Spacing.md }}
          />
          
          <Input
            label="Input with Error"
            variant="outlined"
            placeholder="Enter email"
            error="Please enter a valid email"
            value={inputText}
            onChangeText={setInputText}
            containerStyle={{ marginBottom: Spacing.md }}
          />
          
          <Input
            label="Input with Hint"
            variant="outlined"
            placeholder="Enter phone number"
            hint="Format: (123) 456-7890"
            value={inputText}
            onChangeText={setInputText}
            containerStyle={{ marginBottom: Spacing.md }}
          />
          
          <ThemedText variant="h5" style={{ marginTop: Spacing.lg, marginBottom: Spacing.md }}>Switch</ThemedText>
          
          <View style={styles.switchContainer}>
            <ThemedText variant="bodyMedium">Toggle setting</ThemedText>
            <Switch
              value={switchValue}
              onValueChange={setSwitchValue}
              trackColor={{ false: '#767577', true: tintColor }}
              thumbColor="#fff"
            />
          </View>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  content: {
    paddingBottom: 40,
  },
  section: {
    borderRadius: 8,
    marginBottom: Spacing.xl,
  },
  demoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  demoItem: {
    marginRight: Spacing.md,
    marginBottom: Spacing.md,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
});
