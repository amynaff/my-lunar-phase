import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  Share,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  Users,
  Heart,
  Copy,
  Link,
  UserPlus,
  X,
  Unlink,
  Share2,
  Check,
} from 'lucide-react-native';
import { useThemeStore, getTheme } from '@/lib/theme-store';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { api } from '@/lib/api/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useFonts,
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
} from '@expo-google-fonts/quicksand';

// ---------- Types ----------

interface PartnerStatus {
  hasPartner: boolean;
  isMainUser?: boolean;
  partnerName?: string;
  connectedSince?: string;
  pendingInvite?: { code: string; expiresAt: string } | null;
}

interface InviteResponse {
  code: string;
  expiresAt: string;
}

interface AcceptResponse {
  success: boolean;
  partnerName: string;
}

interface DisconnectResponse {
  success: boolean;
}

// ---------- Component ----------

export default function PartnerSettingsScreen() {
  const insets = useSafeAreaInsets();
  const themeMode = useThemeStore((s) => s.mode);
  const theme = getTheme(themeMode);
  const queryClient = useQueryClient();

  const [inviteInput, setInviteInput] = useState('');
  const [copiedRecently, setCopiedRecently] = useState(false);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
  });

  // ---------- Queries / Mutations ----------

  const {
    data: status,
    isLoading: statusLoading,
    isError: statusError,
    refetch: refetchStatus,
  } = useQuery<PartnerStatus>({
    queryKey: ['partner-status'],
    queryFn: () => api.get<PartnerStatus>('/api/partner/status'),
  });

  const generateInviteMutation = useMutation<InviteResponse>({
    mutationFn: () => api.post<InviteResponse>('/api/partner/invite', {}),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['partner-status'] });
    },
  });

  const acceptInviteMutation = useMutation<AcceptResponse, Error, string>({
    mutationFn: (code: string) =>
      api.post<AcceptResponse>('/api/partner/accept', { code }),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setInviteInput('');
      queryClient.invalidateQueries({ queryKey: ['partner-status'] });
    },
  });

  const disconnectMutation = useMutation<DisconnectResponse>({
    mutationFn: () => api.delete<DisconnectResponse>('/api/partner/disconnect'),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['partner-status'] });
    },
  });

  // ---------- Helpers ----------

  if (!fontsLoaded) return null;

  const pendingInvite =
    generateInviteMutation.data ?? status?.pendingInvite ?? null;

  const handleCopyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopiedRecently(true);
    setTimeout(() => setCopiedRecently(false), 2000);
  };

  const handleShareCode = async (code: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `Join me on My Lunar Phase! Use this partner invite code: ${code}`,
      });
    } catch {
      // user cancelled share
    }
  };

  const handleDisconnect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Disconnect Partner',
      'Are you sure you want to disconnect from your partner? They will no longer be able to see your cycle information.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => disconnectMutation.mutate(),
        },
      ]
    );
  };

  const handleAcceptInvite = () => {
    const trimmed = inviteInput.trim();
    if (!trimmed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    acceptInviteMutation.mutate(trimmed);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatExpiry = (dateString: string) => {
    const diff = new Date(dateString).getTime() - Date.now();
    const minutes = Math.max(0, Math.round(diff / 60000));
    if (minutes < 60) return `Expires in ${minutes}m`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `Expires in ${hours}h`;
    const days = Math.round(hours / 24);
    return `Expires in ${days}d`;
  };

  // ---------- Render helpers ----------

  const renderLoading = () => (
    <Animated.View
      entering={FadeInUp.delay(200).duration(600)}
      className="mx-6 mt-12 items-center justify-center py-20"
    >
      <ActivityIndicator size="large" color={theme.accent.purple} />
      <Text
        style={{
          fontFamily: 'Quicksand_500Medium',
          color: theme.text.tertiary,
        }}
        className="text-sm mt-4"
      >
        Loading partner status...
      </Text>
    </Animated.View>
  );

  const renderError = () => (
    <Animated.View
      entering={FadeInUp.delay(200).duration(600)}
      className="mx-6 mt-12 items-center justify-center py-16"
    >
      <View
        className="w-16 h-16 rounded-full items-center justify-center mb-4"
        style={{ backgroundColor: `${theme.accent.pink}20` }}
      >
        <X size={28} color={theme.accent.pink} />
      </View>
      <Text
        style={{
          fontFamily: 'Quicksand_600SemiBold',
          color: theme.text.primary,
        }}
        className="text-base mb-2"
      >
        Something went wrong
      </Text>
      <Text
        style={{
          fontFamily: 'Quicksand_400Regular',
          color: theme.text.tertiary,
        }}
        className="text-sm text-center mb-6"
      >
        Could not load partner information. Please try again.
      </Text>
      <Pressable
        onPress={() => refetchStatus()}
        className="px-6 py-3 rounded-full"
        style={{ backgroundColor: theme.accent.purple }}
      >
        <Text
          style={{ fontFamily: 'Quicksand_600SemiBold', color: '#fff' }}
          className="text-sm"
        >
          Retry
        </Text>
      </Pressable>
    </Animated.View>
  );

  const renderNoPartner = () => (
    <>
      {/* Share Your Journey Card */}
      <Animated.View
        entering={FadeInUp.delay(200).duration(600)}
        className="mx-6 mt-6"
      >
        <View
          className="rounded-3xl p-5 border overflow-hidden"
          style={{
            backgroundColor: theme.bg.card,
            borderColor: theme.border.light,
          }}
        >
          <View className="flex-row items-center mb-4">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: `${theme.accent.rose}20` }}
            >
              <Share2 size={20} color={theme.accent.rose} />
            </View>
            <View className="flex-1">
              <Text
                style={{
                  fontFamily: 'Quicksand_600SemiBold',
                  color: theme.text.primary,
                }}
                className="text-base"
              >
                Share Your Journey
              </Text>
              <Text
                style={{
                  fontFamily: 'Quicksand_400Regular',
                  color: theme.text.tertiary,
                }}
                className="text-xs"
              >
                Generate a code and share it with your partner
              </Text>
            </View>
          </View>

          {pendingInvite ? (
            <View>
              {/* Invite Code Display */}
              <View
                className="rounded-2xl p-4 items-center mb-3"
                style={{ backgroundColor: theme.bg.secondary }}
              >
                <Text
                  style={{
                    fontFamily: 'Quicksand_400Regular',
                    color: theme.text.tertiary,
                  }}
                  className="text-xs mb-2 uppercase tracking-wider"
                >
                  Your Invite Code
                </Text>
                <Text
                  style={{
                    fontFamily: 'CormorantGaramond_600SemiBold',
                    color: theme.accent.purple,
                    letterSpacing: 6,
                  }}
                  className="text-4xl"
                  selectable
                >
                  {pendingInvite.code}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Quicksand_400Regular',
                    color: theme.text.muted,
                  }}
                  className="text-xs mt-2"
                >
                  {formatExpiry(pendingInvite.expiresAt)}
                </Text>
              </View>

              {/* Copy & Share Buttons */}
              <View className="flex-row" style={{ gap: 10 }}>
                <Pressable
                  onPress={() => handleCopyCode(pendingInvite.code)}
                  className="flex-1 flex-row items-center justify-center py-3 rounded-2xl border"
                  style={{
                    backgroundColor: copiedRecently
                      ? `${theme.accent.purple}15`
                      : theme.bg.secondary,
                    borderColor: copiedRecently
                      ? theme.accent.purple
                      : theme.border.light,
                  }}
                >
                  {copiedRecently ? (
                    <Check size={16} color={theme.accent.purple} />
                  ) : (
                    <Copy size={16} color={theme.accent.purple} />
                  )}
                  <Text
                    style={{
                      fontFamily: 'Quicksand_600SemiBold',
                      color: theme.accent.purple,
                    }}
                    className="text-sm ml-2"
                  >
                    {copiedRecently ? 'Copied' : 'Copy'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleShareCode(pendingInvite.code)}
                  className="flex-1 flex-row items-center justify-center py-3 rounded-2xl"
                  style={{ backgroundColor: theme.accent.purple }}
                >
                  <Share2 size={16} color="#fff" />
                  <Text
                    style={{
                      fontFamily: 'Quicksand_600SemiBold',
                      color: '#fff',
                    }}
                    className="text-sm ml-2"
                  >
                    Share
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                generateInviteMutation.mutate();
              }}
              disabled={generateInviteMutation.isPending}
              className="py-3.5 rounded-2xl items-center justify-center flex-row"
              style={{
                opacity: generateInviteMutation.isPending ? 0.6 : 1,
              }}
            >
              <LinearGradient
                colors={['#9d84ed', '#f9a8d4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 16,
                }}
              />
              {generateInviteMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Link size={18} color="#fff" />
                  <Text
                    style={{
                      fontFamily: 'Quicksand_600SemiBold',
                      color: '#fff',
                    }}
                    className="text-sm ml-2"
                  >
                    Generate Invite Code
                  </Text>
                </>
              )}
            </Pressable>
          )}

          {generateInviteMutation.isError && (
            <Text
              style={{
                fontFamily: 'Quicksand_400Regular',
                color: theme.accent.pink,
              }}
              className="text-xs text-center mt-3"
            >
              Failed to generate invite code. Please try again.
            </Text>
          )}
        </View>
      </Animated.View>

      {/* Join a Partner Card */}
      <Animated.View
        entering={FadeInUp.delay(300).duration(600)}
        className="mx-6 mt-5"
      >
        <View
          className="rounded-3xl p-5 border"
          style={{
            backgroundColor: theme.bg.card,
            borderColor: theme.border.light,
          }}
        >
          <View className="flex-row items-center mb-4">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: `${theme.accent.lavender}20` }}
            >
              <UserPlus size={20} color={theme.accent.lavender} />
            </View>
            <View className="flex-1">
              <Text
                style={{
                  fontFamily: 'Quicksand_600SemiBold',
                  color: theme.text.primary,
                }}
                className="text-base"
              >
                Join a Partner
              </Text>
              <Text
                style={{
                  fontFamily: 'Quicksand_400Regular',
                  color: theme.text.tertiary,
                }}
                className="text-xs"
              >
                Enter the code your partner shared with you
              </Text>
            </View>
          </View>

          <View
            className="rounded-2xl border flex-row items-center px-4"
            style={{
              backgroundColor: theme.bg.input,
              borderColor: theme.border.light,
            }}
          >
            <Link size={16} color={theme.text.muted} />
            <TextInput
              value={inviteInput}
              onChangeText={setInviteInput}
              placeholder="Enter invite code"
              placeholderTextColor={theme.text.muted}
              autoCapitalize="characters"
              autoCorrect={false}
              style={{
                flex: 1,
                fontFamily: 'Quicksand_500Medium',
                color: theme.text.primary,
                paddingVertical: 14,
                paddingHorizontal: 12,
                fontSize: 15,
                letterSpacing: 2,
              }}
            />
          </View>

          <Pressable
            onPress={handleAcceptInvite}
            disabled={
              !inviteInput.trim() || acceptInviteMutation.isPending
            }
            className="mt-3 py-3.5 rounded-2xl items-center justify-center flex-row"
            style={{
              backgroundColor: inviteInput.trim()
                ? theme.accent.purple
                : theme.bg.secondary,
              opacity:
                !inviteInput.trim() || acceptInviteMutation.isPending
                  ? 0.5
                  : 1,
            }}
          >
            {acceptInviteMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <UserPlus size={18} color={inviteInput.trim() ? '#fff' : theme.text.muted} />
                <Text
                  style={{
                    fontFamily: 'Quicksand_600SemiBold',
                    color: inviteInput.trim() ? '#fff' : theme.text.muted,
                  }}
                  className="text-sm ml-2"
                >
                  Connect with Partner
                </Text>
              </>
            )}
          </Pressable>

          {acceptInviteMutation.isError && (
            <Text
              style={{
                fontFamily: 'Quicksand_400Regular',
                color: theme.accent.pink,
              }}
              className="text-xs text-center mt-3"
            >
              Invalid or expired invite code. Please check and try again.
            </Text>
          )}
        </View>
      </Animated.View>

      {/* Info Note */}
      <Animated.View
        entering={FadeInUp.delay(400).duration(600)}
        className="mx-6 mt-5"
      >
        <View className="flex-row items-start px-2">
          <Heart
            size={14}
            color={theme.text.muted}
            style={{ marginTop: 2 }}
          />
          <Text
            style={{
              fontFamily: 'Quicksand_400Regular',
              color: theme.text.muted,
            }}
            className="text-xs ml-2 flex-1 leading-5"
          >
            Partner support lets someone close to you see your current phase
            and receive tips on how to best support you throughout your cycle.
          </Text>
        </View>
      </Animated.View>
    </>
  );

  const renderConnectedMainUser = () => (
    <>
      {/* Connected Status Card */}
      <Animated.View
        entering={FadeInUp.delay(200).duration(600)}
        className="mx-6 mt-6"
      >
        <LinearGradient
          colors={[`${theme.accent.purple}15`, `${theme.accent.rose}10`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 24,
            padding: 24,
            borderWidth: 1,
            borderColor: theme.border.light,
          }}
        >
          <View className="items-center mb-5">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: `${theme.accent.purple}20` }}
            >
              <Users size={28} color={theme.accent.purple} />
            </View>
            <Text
              style={{
                fontFamily: 'CormorantGaramond_600SemiBold',
                color: theme.text.primary,
              }}
              className="text-2xl"
            >
              Connected
            </Text>
          </View>

          <View
            className="rounded-2xl p-4 mb-4"
            style={{ backgroundColor: theme.bg.card }}
          >
            <View className="flex-row items-center mb-3">
              <Heart size={16} color={theme.accent.rose} />
              <Text
                style={{
                  fontFamily: 'Quicksand_600SemiBold',
                  color: theme.text.primary,
                }}
                className="text-base ml-3"
              >
                {status?.partnerName ?? 'Your Partner'}
              </Text>
            </View>
            {status?.connectedSince && (
              <Text
                style={{
                  fontFamily: 'Quicksand_400Regular',
                  color: theme.text.tertiary,
                }}
                className="text-xs"
              >
                Connected since {formatDate(status.connectedSince)}
              </Text>
            )}
          </View>

          <View
            className="rounded-2xl p-4"
            style={{ backgroundColor: `${theme.accent.lavender}10` }}
          >
            <Text
              style={{
                fontFamily: 'Quicksand_400Regular',
                color: theme.text.secondary,
              }}
              className="text-sm leading-5 text-center"
            >
              Your partner can see your current phase and supportive tips
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Disconnect Button */}
      <Animated.View
        entering={FadeInUp.delay(350).duration(600)}
        className="mx-6 mt-6"
      >
        <Pressable
          onPress={handleDisconnect}
          disabled={disconnectMutation.isPending}
          className="flex-row items-center justify-center py-4 rounded-2xl border"
          style={{
            borderColor: `${theme.accent.pink}40`,
            backgroundColor: `${theme.accent.pink}08`,
            opacity: disconnectMutation.isPending ? 0.5 : 1,
          }}
        >
          {disconnectMutation.isPending ? (
            <ActivityIndicator size="small" color={theme.accent.pink} />
          ) : (
            <>
              <Unlink size={18} color={theme.accent.pink} />
              <Text
                style={{
                  fontFamily: 'Quicksand_600SemiBold',
                  color: theme.accent.pink,
                }}
                className="text-sm ml-2"
              >
                Disconnect Partner
              </Text>
            </>
          )}
        </Pressable>
      </Animated.View>
    </>
  );

  const renderConnectedPartnerViewer = () => (
    <>
      {/* Connected Status Card */}
      <Animated.View
        entering={FadeInUp.delay(200).duration(600)}
        className="mx-6 mt-6"
      >
        <LinearGradient
          colors={[`${theme.accent.lavender}15`, `${theme.accent.purple}10`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 24,
            padding: 24,
            borderWidth: 1,
            borderColor: theme.border.light,
          }}
        >
          <View className="items-center mb-5">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: `${theme.accent.rose}20` }}
            >
              <Heart size={28} color={theme.accent.rose} />
            </View>
            <Text
              style={{
                fontFamily: 'CormorantGaramond_600SemiBold',
                color: theme.text.primary,
              }}
              className="text-2xl"
            >
              Supporting
            </Text>
          </View>

          <View
            className="rounded-2xl p-4 mb-4"
            style={{ backgroundColor: theme.bg.card }}
          >
            <View className="flex-row items-center mb-3">
              <Users size={16} color={theme.accent.purple} />
              <Text
                style={{
                  fontFamily: 'Quicksand_600SemiBold',
                  color: theme.text.primary,
                }}
                className="text-base ml-3"
              >
                {status?.partnerName ?? 'Your Partner'}
              </Text>
            </View>
            {status?.connectedSince && (
              <Text
                style={{
                  fontFamily: 'Quicksand_400Regular',
                  color: theme.text.tertiary,
                }}
                className="text-xs"
              >
                Connected since {formatDate(status.connectedSince)}
              </Text>
            )}
          </View>

          {/* View Partner Button */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(app)/partner-view');
            }}
            className="py-4 rounded-2xl items-center justify-center flex-row"
          >
            <LinearGradient
              colors={['#9d84ed', '#c4b5fd']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 16,
              }}
            />
            <Users size={18} color="#fff" />
            <Text
              style={{
                fontFamily: 'Quicksand_600SemiBold',
                color: '#fff',
              }}
              className="text-sm ml-2"
            >
              View Partner
            </Text>
          </Pressable>
        </LinearGradient>
      </Animated.View>

      {/* Disconnect Button */}
      <Animated.View
        entering={FadeInUp.delay(350).duration(600)}
        className="mx-6 mt-6"
      >
        <Pressable
          onPress={handleDisconnect}
          disabled={disconnectMutation.isPending}
          className="flex-row items-center justify-center py-4 rounded-2xl border"
          style={{
            borderColor: `${theme.accent.pink}40`,
            backgroundColor: `${theme.accent.pink}08`,
            opacity: disconnectMutation.isPending ? 0.5 : 1,
          }}
        >
          {disconnectMutation.isPending ? (
            <ActivityIndicator size="small" color={theme.accent.pink} />
          ) : (
            <>
              <Unlink size={18} color={theme.accent.pink} />
              <Text
                style={{
                  fontFamily: 'Quicksand_600SemiBold',
                  color: theme.accent.pink,
                }}
                className="text-sm ml-2"
              >
                Disconnect Partner
              </Text>
            </>
          )}
        </Pressable>
      </Animated.View>
    </>
  );

  // ---------- Main Render ----------

  const renderContent = () => {
    if (statusLoading) return renderLoading();
    if (statusError) return renderError();
    if (!status) return renderLoading();

    if (status.hasPartner && status.isMainUser) return renderConnectedMainUser();
    if (status.hasPartner && !status.isMainUser) return renderConnectedPartnerViewer();
    return renderNoPartner();
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={theme.gradient}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(600)}
            style={{ paddingTop: insets.top + 16 }}
            className="px-6"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Heart
                  size={24}
                  color={theme.accent.rose}
                  style={{ marginRight: 10 }}
                />
                <Text
                  style={{
                    fontFamily: 'CormorantGaramond_600SemiBold',
                    color: theme.text.primary,
                  }}
                  className="text-3xl"
                >
                  Partner Support
                </Text>
              </View>
              <Pressable
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full items-center justify-center border"
                style={{
                  backgroundColor: theme.bg.card,
                  borderColor: theme.border.light,
                }}
              >
                <X size={20} color={theme.accent.purple} />
              </Pressable>
            </View>

            {/* Subtitle */}
            <Text
              style={{
                fontFamily: 'Quicksand_400Regular',
                color: theme.text.tertiary,
              }}
              className="text-sm mt-2"
            >
              Let someone special support you through your cycle
            </Text>
          </Animated.View>

          {renderContent()}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
