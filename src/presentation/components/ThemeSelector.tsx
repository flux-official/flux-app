import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useThemeStore } from '../../infrastructure/stores/themeStore';
import { ColorTheme } from '../theme/colorThemes';
import { createDynamicDesignSystem } from '../theme/dynamicDesignSystem';

interface ThemeSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export default function ThemeSelector({ visible, onClose }: ThemeSelectorProps) {
  const { currentTheme, availableThemes, setTheme } = useThemeStore();
  const designSystem = createDynamicDesignSystem(currentTheme);
  const { colors, semanticColors, typography, spacing, borderRadius, shadows } = designSystem;

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId);
  };

  const ThemePreviewCard = ({ theme, index }: { theme: ColorTheme; index: number }) => {
    const isSelected = theme.id === currentTheme.id;
    
    return (
      <Animated.View entering={FadeInDown.delay(index * 100).duration(600)}>
        <TouchableOpacity
          style={[
            styles.themeCard,
            {
              borderColor: isSelected ? theme.colors.primary[500] : colors.neutral[200],
              borderWidth: isSelected ? 2 : 1,
              backgroundColor: colors.white,
            }
          ]}
          onPress={() => handleThemeSelect(theme.id)}
          activeOpacity={0.8}
        >
          {/* 테마 미리보기 색상 팔레트 */}
          <View style={styles.colorPreview}>
            <LinearGradient
              colors={[theme.colors.primary[500], theme.colors.primary[600]]}
              style={styles.primaryColor}
            />
            <LinearGradient
              colors={[theme.colors.secondary[500], theme.colors.secondary[600]]}
              style={styles.secondaryColor}
            />
            <LinearGradient
              colors={[theme.colors.accent[500], theme.colors.accent[600]]}
              style={styles.accentColor}
            />
          </View>

          {/* 테마 정보 */}
          <View style={styles.themeInfo}>
            <View style={styles.themeHeader}>
              <Text style={[styles.themeName, { color: semanticColors.text.primary }]}>
                {theme.name}
              </Text>
              {isSelected && (
                <View style={[styles.selectedBadge, { backgroundColor: theme.colors.primary[500] }]}>
                  <Icon name="check" size={16} color={colors.white} />
                </View>
              )}
            </View>
            <Text style={[styles.themeDescription, { color: semanticColors.text.secondary }]}>
              {theme.description}
            </Text>
          </View>

          {/* 미니 프리뷰 UI */}
          <View style={styles.miniPreview}>
            {/* 미니 헤더 */}
            <LinearGradient
              colors={[theme.colors.primary[500], theme.colors.primary[600]]}
              style={styles.miniHeader}
            />
            {/* 미니 컨텐츠 */}
            <View style={[styles.miniContent, { backgroundColor: colors.neutral[50] }]}>
              <View style={[styles.miniCard, { backgroundColor: colors.white }]} />
              <View style={[styles.miniCard, { backgroundColor: colors.white }]} />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // 동적 스타일 생성
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingBottom: spacing[6],
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: spacing[6],
      paddingTop: spacing[4],
    },
    headerLeft: {
      flex: 1,
    },
    headerTitle: {
      ...typography.styles.h2,
      marginBottom: spacing[1],
    },
    headerSubtitle: {
      ...typography.styles.body2,
      opacity: 0.9,
    },
    closeButton: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: spacing[6],
      paddingBottom: spacing[20],
    },
    sectionTitle: {
      ...typography.styles.h3,
      marginBottom: spacing[2],
    },
    sectionDescription: {
      ...typography.styles.body2,
      marginBottom: spacing[6],
    },
    themeCard: {
      borderRadius: borderRadius.lg,
      marginBottom: spacing[4],
      overflow: 'hidden',
      ...shadows.base,
    },
    colorPreview: {
      flexDirection: 'row',
      height: 8,
    },
    primaryColor: {
      flex: 2,
    },
    secondaryColor: {
      flex: 1.5,
    },
    accentColor: {
      flex: 1,
    },
    themeInfo: {
      padding: spacing[4],
    },
    themeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[2],
    },
    themeName: {
      ...typography.styles.body1,
      fontWeight: typography.fontWeight.semibold,
    },
    selectedBadge: {
      width: 24,
      height: 24,
      borderRadius: borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
    },
    themeDescription: {
      ...typography.styles.body2,
      lineHeight: 20,
    },
    miniPreview: {
      margin: spacing[4],
      marginTop: 0,
      borderRadius: borderRadius.base,
      overflow: 'hidden',
      height: 60,
    },
    miniHeader: {
      height: 20,
    },
    miniContent: {
      flex: 1,
      padding: spacing[2],
      flexDirection: 'row',
      gap: 4,
    },
    miniCard: {
      flex: 1,
      borderRadius: borderRadius.sm,
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing[4],
      borderRadius: borderRadius.md,
      marginTop: spacing[4],
      borderWidth: 1,
    },
    infoText: {
      ...typography.styles.body2,
      marginLeft: spacing[3],
      flex: 1,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: semanticColors.background.secondary }]}>
        {/* 헤더 */}
        <LinearGradient
          colors={[colors.primary[500], colors.primary[600]]}
          style={styles.header}
        >
          <SafeAreaView edges={['top']}>
            <Animated.View entering={FadeInUp.delay(100).duration(600)}>
              <View style={styles.headerContent}>
                <View style={styles.headerLeft}>
                  <Text style={[styles.headerTitle, { color: colors.white }]}>
                    테마 선택
                  </Text>
                  <Text style={[styles.headerSubtitle, { color: colors.white }]}>
                    원하는 색상 테마를 선택하세요
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                >
                  <Icon name="close" size={24} color={colors.white} />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>

        {/* 테마 리스트 */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View entering={FadeInUp.delay(200).duration(600)}>
            <Text style={[styles.sectionTitle, { color: semanticColors.text.primary }]}>
              블록체인 & 스테이블코인 테마
            </Text>
            <Text style={[styles.sectionDescription, { color: semanticColors.text.secondary }]}>
              각 테마를 탭하여 즉시 적용해보세요
            </Text>
          </Animated.View>

          {availableThemes.map((theme, index) => (
            <ThemePreviewCard key={theme.id} theme={theme} index={index} />
          ))}

          {/* 적용 안내 */}
          <Animated.View 
            entering={FadeInUp.delay(600).duration(600)}
            style={[styles.infoCard, { 
              backgroundColor: colors.primary[50],
              borderColor: colors.primary[200],
            }]}
          >
            <Icon name="information" size={20} color={colors.primary[500]} />
            <Text style={[styles.infoText, { color: colors.primary[700] }]}>
              선택한 테마는 즉시 전체 앱에 적용됩니다
            </Text>
          </Animated.View>
        </ScrollView>
      </View>
    </Modal>
  );
}

