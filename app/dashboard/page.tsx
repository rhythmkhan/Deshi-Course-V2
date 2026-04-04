'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Check,
  CheckCircle,
  Clock,
  Coins,
  Copy,
  Gift,
  Headphones,
  Layers3,
  Link2,
  LogOut,
  Mail,
  MessageCircle,
  Search,
  Send,
  Share2,
  Store,
  TicketPercent,
  User,
  UserPlus,
} from 'lucide-react';
import { motion } from 'motion/react';
import AddToCartButton from '@/components/AddToCartButton';
import { useAuth } from '@/components/AuthProvider';
import BrandLogo from '@/components/BrandLogo';
import { BUNDLE_CATALOG } from '@/lib/bundle-catalog';
import { COURSE_CATALOG } from '@/lib/course-catalog';
import { buildFallbackReferralCode, formatPrice, getPricingPreview, REFERRAL_DISCOUNT_RATE, REFERRER_WALLET_CREDIT } from '@/lib/referral';
import { SHOP_CATALOG } from '@/lib/shop-catalog';

function md5(input: string) {
  function rotateLeft(value: number, amount: number) {
    return (value << amount) | (value >>> (32 - amount));
  }

  function addUnsigned(x: number, y: number) {
    const x4 = x & 0x40000000;
    const y4 = y & 0x40000000;
    const x8 = x & 0x80000000;
    const y8 = y & 0x80000000;
    const result = (x & 0x3fffffff) + (y & 0x3fffffff);

    if (x4 & y4) {
      return result ^ 0x80000000 ^ x8 ^ y8;
    }

    if (x4 | y4) {
      if (result & 0x40000000) {
        return result ^ 0xc0000000 ^ x8 ^ y8;
      }

      return result ^ 0x40000000 ^ x8 ^ y8;
    }

    return result ^ x8 ^ y8;
  }

  function f(x: number, y: number, z: number) {
    return (x & y) | (~x & z);
  }

  function g(x: number, y: number, z: number) {
    return (x & z) | (y & ~z);
  }

  function h(x: number, y: number, z: number) {
    return x ^ y ^ z;
  }

  function i(x: number, y: number, z: number) {
    return y ^ (x | ~z);
  }

  function ff(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function gg(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function hh(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function ii(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function convertToWordArray(value: string) {
    const wordCount = (((value.length + 8) >> 6) + 1) * 16;
    const wordArray = new Array<number>(wordCount - 1);
    let bytePosition = 0;
    let byteCount = 0;

    while (byteCount < value.length) {
      const wordIndex = byteCount >> 2;
      bytePosition = (byteCount % 4) * 8;
      wordArray[wordIndex] = wordArray[wordIndex] | (value.charCodeAt(byteCount) << bytePosition);
      byteCount += 1;
    }

    const wordIndex = byteCount >> 2;
    bytePosition = (byteCount % 4) * 8;
    wordArray[wordIndex] = wordArray[wordIndex] | (0x80 << bytePosition);
    wordArray[wordCount - 2] = value.length << 3;
    wordArray[wordCount - 1] = value.length >>> 29;

    return wordArray;
  }

  function wordToHex(value: number) {
    let output = '';

    for (let count = 0; count <= 3; count += 1) {
      const byte = (value >>> (count * 8)) & 255;
      const hex = `0${byte.toString(16)}`;
      output += hex.slice(-2);
    }

    return output;
  }

  const normalized = unescape(encodeURIComponent(input));
  const words = convertToWordArray(normalized);
  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  for (let k = 0; k < words.length; k += 16) {
    const aa = a;
    const bb = b;
    const cc = c;
    const dd = d;

    a = ff(a, b, c, d, words[k + 0], 7, 0xd76aa478);
    d = ff(d, a, b, c, words[k + 1], 12, 0xe8c7b756);
    c = ff(c, d, a, b, words[k + 2], 17, 0x242070db);
    b = ff(b, c, d, a, words[k + 3], 22, 0xc1bdceee);
    a = ff(a, b, c, d, words[k + 4], 7, 0xf57c0faf);
    d = ff(d, a, b, c, words[k + 5], 12, 0x4787c62a);
    c = ff(c, d, a, b, words[k + 6], 17, 0xa8304613);
    b = ff(b, c, d, a, words[k + 7], 22, 0xfd469501);
    a = ff(a, b, c, d, words[k + 8], 7, 0x698098d8);
    d = ff(d, a, b, c, words[k + 9], 12, 0x8b44f7af);
    c = ff(c, d, a, b, words[k + 10], 17, 0xffff5bb1);
    b = ff(b, c, d, a, words[k + 11], 22, 0x895cd7be);
    a = ff(a, b, c, d, words[k + 12], 7, 0x6b901122);
    d = ff(d, a, b, c, words[k + 13], 12, 0xfd987193);
    c = ff(c, d, a, b, words[k + 14], 17, 0xa679438e);
    b = ff(b, c, d, a, words[k + 15], 22, 0x49b40821);

    a = gg(a, b, c, d, words[k + 1], 5, 0xf61e2562);
    d = gg(d, a, b, c, words[k + 6], 9, 0xc040b340);
    c = gg(c, d, a, b, words[k + 11], 14, 0x265e5a51);
    b = gg(b, c, d, a, words[k + 0], 20, 0xe9b6c7aa);
    a = gg(a, b, c, d, words[k + 5], 5, 0xd62f105d);
    d = gg(d, a, b, c, words[k + 10], 9, 0x02441453);
    c = gg(c, d, a, b, words[k + 15], 14, 0xd8a1e681);
    b = gg(b, c, d, a, words[k + 4], 20, 0xe7d3fbc8);
    a = gg(a, b, c, d, words[k + 9], 5, 0x21e1cde6);
    d = gg(d, a, b, c, words[k + 14], 9, 0xc33707d6);
    c = gg(c, d, a, b, words[k + 3], 14, 0xf4d50d87);
    b = gg(b, c, d, a, words[k + 8], 20, 0x455a14ed);
    a = gg(a, b, c, d, words[k + 13], 5, 0xa9e3e905);
    d = gg(d, a, b, c, words[k + 2], 9, 0xfcefa3f8);
    c = gg(c, d, a, b, words[k + 7], 14, 0x676f02d9);
    b = gg(b, c, d, a, words[k + 12], 20, 0x8d2a4c8a);

    a = hh(a, b, c, d, words[k + 5], 4, 0xfffa3942);
    d = hh(d, a, b, c, words[k + 8], 11, 0x8771f681);
    c = hh(c, d, a, b, words[k + 11], 16, 0x6d9d6122);
    b = hh(b, c, d, a, words[k + 14], 23, 0xfde5380c);
    a = hh(a, b, c, d, words[k + 1], 4, 0xa4beea44);
    d = hh(d, a, b, c, words[k + 4], 11, 0x4bdecfa9);
    c = hh(c, d, a, b, words[k + 7], 16, 0xf6bb4b60);
    b = hh(b, c, d, a, words[k + 10], 23, 0xbebfbc70);
    a = hh(a, b, c, d, words[k + 13], 4, 0x289b7ec6);
    d = hh(d, a, b, c, words[k + 0], 11, 0xeaa127fa);
    c = hh(c, d, a, b, words[k + 3], 16, 0xd4ef3085);
    b = hh(b, c, d, a, words[k + 6], 23, 0x04881d05);
    a = hh(a, b, c, d, words[k + 9], 4, 0xd9d4d039);
    d = hh(d, a, b, c, words[k + 12], 11, 0xe6db99e5);
    c = hh(c, d, a, b, words[k + 15], 16, 0x1fa27cf8);
    b = hh(b, c, d, a, words[k + 2], 23, 0xc4ac5665);

    a = ii(a, b, c, d, words[k + 0], 6, 0xf4292244);
    d = ii(d, a, b, c, words[k + 7], 10, 0x432aff97);
    c = ii(c, d, a, b, words[k + 14], 15, 0xab9423a7);
    b = ii(b, c, d, a, words[k + 5], 21, 0xfc93a039);
    a = ii(a, b, c, d, words[k + 12], 6, 0x655b59c3);
    d = ii(d, a, b, c, words[k + 3], 10, 0x8f0ccc92);
    c = ii(c, d, a, b, words[k + 10], 15, 0xffeff47d);
    b = ii(b, c, d, a, words[k + 1], 21, 0x85845dd1);
    a = ii(a, b, c, d, words[k + 8], 6, 0x6fa87e4f);
    d = ii(d, a, b, c, words[k + 15], 10, 0xfe2ce6e0);
    c = ii(c, d, a, b, words[k + 6], 15, 0xa3014314);
    b = ii(b, c, d, a, words[k + 13], 21, 0x4e0811a1);
    a = ii(a, b, c, d, words[k + 4], 6, 0xf7537e82);
    d = ii(d, a, b, c, words[k + 11], 10, 0xbd3af235);
    c = ii(c, d, a, b, words[k + 2], 15, 0x2ad7d2bb);
    b = ii(b, c, d, a, words[k + 9], 21, 0xeb86d391);

    a = addUnsigned(a, aa);
    b = addUnsigned(b, bb);
    c = addUnsigned(c, cc);
    d = addUnsigned(d, dd);
  }

  return `${wordToHex(a)}${wordToHex(b)}${wordToHex(c)}${wordToHex(d)}`;
}

function resolveAvatarUrl(email: string, avatarUrl?: string, fullName?: string) {
  if (avatarUrl) {
    return avatarUrl;
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail) {
    return `https://www.gravatar.com/avatar/${md5(normalizedEmail)}?d=identicon&s=160`;
  }

  const fallbackName = encodeURIComponent(fullName || 'Deshi Course');
  return `https://ui-avatars.com/api/?name=${fallbackName}&background=6d28d9&color=fff&size=160`;
}

interface ReferralEntry {
  id: string;
  created_at: string;
  wallet_credit: number;
}

interface ProfileState {
  walletBalance: number;
  referralCode: string;
  referredBy: string | null;
  pendingReferralCode: string;
  welcomeDiscountUsesRemaining: number;
}

interface EnrollmentRow {
  course_slug: string;
  progress: number | null;
  enrollment_status: string | null;
}

interface DashboardOrderRow {
  id: string;
  course_slug: string;
  metadata?: Record<string, unknown> | null;
}

interface DashboardOrderItemRow {
  order_id: string;
  item_type: 'course' | 'bundle' | 'shop';
  item_slug: string;
}

interface DeliveryAccessLink {
  track: 'n8n' | 'vibe';
  resource: 'course' | 'support' | 'template';
  label: string;
  url: string;
}

function decodeDashboardOrderItems(encodedValue: string) {
  if (!encodedValue.startsWith('cart:')) {
    return [];
  }

  return encodedValue
    .slice(5)
    .split('|')
    .map((entry) => {
      const [type, ...slugParts] = entry.split(':');
      const slug = slugParts.join(':');

      if (!type || !slug || !['course', 'bundle', 'shop'].includes(type)) {
        return null;
      }

      return {
        type: type as DashboardOrderItemRow['item_type'],
        slug,
      };
    })
    .filter((item): item is { type: DashboardOrderItemRow['item_type']; slug: string } => Boolean(item));
}

function extractDeliveryAccessLinks(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return [] as DeliveryAccessLink[];
  }

  const rawMetadata = metadata as Record<string, unknown>;
  const rawDeliveryLinks = rawMetadata.deliveryLinks;

  if (!rawDeliveryLinks || typeof rawDeliveryLinks !== 'object' || Array.isArray(rawDeliveryLinks)) {
    return [] as DeliveryAccessLink[];
  }

  const output: DeliveryAccessLink[] = [];
  const deliveryTracks = rawDeliveryLinks as Record<string, unknown>;

  for (const track of ['n8n', 'vibe'] as const) {
    const trackData = deliveryTracks[track];

    if (!trackData || typeof trackData !== 'object' || Array.isArray(trackData)) {
      continue;
    }

    const trackLinks = trackData as Record<string, unknown>;

    for (const resource of ['course', 'support', 'template'] as const) {
      const url = trackLinks[resource];

      if (typeof url !== 'string' || !url) {
        continue;
      }

      const prefix = track === 'vibe' ? 'Vibe Coding' : 'n8n Automation';
      const label =
        resource === 'course'
          ? `${prefix} Telegram channel`
          : resource === 'support'
            ? `${prefix} support group`
            : `${prefix} resource library`;

      output.push({
        track,
        resource,
        label,
        url,
      });
    }
  }

  return output;
}

const courseLevelMeta: Record<'beginner' | 'intermediate' | 'advanced', { label: string; className: string }> = {
  beginner: {
    label: 'Beginner',
    className: 'bg-emerald-500 text-white',
  },
  intermediate: {
    label: 'Intermediate',
    className: 'bg-amber-400 text-gray-900',
  },
  advanced: {
    label: 'Advance',
    className: 'bg-rose-500 text-white',
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const { supabase, user, isConfigured, isLoading: isAuthLoading } = useAuth();
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPresetFilter, setSelectedPresetFilter] = useState<'beginner' | 'intermediate' | 'advanced' | 'free' | null>(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'owned', 'refer', 'shop', 'bundle', 'support'
  const [currentUserId, setCurrentUserId] = useState('');
  const [userName, setUserName] = useState('শিক্ষার্থী');
  const [userEmail, setUserEmail] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [appOrigin, setAppOrigin] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [referralCode, setReferralCode] = useState('');
  const [referralInput, setReferralInput] = useState('');
  const [inviteRecipients, setInviteRecipients] = useState('');
  const [referredBy, setReferredBy] = useState<string | null>(null);
  const [welcomeDiscountUsesRemaining, setWelcomeDiscountUsesRemaining] = useState(0);
  const [recentReferrals, setRecentReferrals] = useState<ReferralEntry[]>([]);
  const [referralCount, setReferralCount] = useState(0);
  const [referralMessage, setReferralMessage] = useState('');
  const [referralError, setReferralError] = useState('');
  const [isApplyingReferral, setIsApplyingReferral] = useState(false);
  const [isMobileProfileMenuOpen, setIsMobileProfileMenuOpen] = useState(false);
  const [ownedCourseSlugs, setOwnedCourseSlugs] = useState<string[]>([]);
  const [courseProgressBySlug, setCourseProgressBySlug] = useState<Record<string, number>>({});
  const [purchasedBundleSlugs, setPurchasedBundleSlugs] = useState<string[]>([]);
  const [purchasedProductSlugs, setPurchasedProductSlugs] = useState<string[]>([]);
  const [deliveryAccessLinks, setDeliveryAccessLinks] = useState<DeliveryAccessLink[]>([]);

  async function loadReferralState(userId: string, fallbackCode: string) {
    if (!supabase) {
      throw new Error('Supabase browser client is not configured.');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('wallet_balance, referral_code, referred_by, pending_referral_code, welcome_discount_uses_remaining')
      .eq('id', userId)
      .single();

    const profileState: ProfileState = {
      walletBalance: Number(profile?.wallet_balance ?? 0),
      referralCode: typeof profile?.referral_code === 'string' ? profile.referral_code : '',
      referredBy: typeof profile?.referred_by === 'string' ? profile.referred_by : null,
      pendingReferralCode:
        typeof profile?.pending_referral_code === 'string' ? profile.pending_referral_code : '',
      welcomeDiscountUsesRemaining: Number(profile?.welcome_discount_uses_remaining ?? 0),
    };

    setWalletBalance(profileState.walletBalance);
    setReferralCode(profileState.referralCode || fallbackCode);
    setReferredBy(profileState.referredBy);
    setWelcomeDiscountUsesRemaining(profileState.welcomeDiscountUsesRemaining);

    if (!profileState.referralCode && profile && !profileError) {
      await supabase
        .from('profiles')
        .update({
          referral_code: fallbackCode,
        })
        .eq('id', userId);

      setReferralCode(fallbackCode);
    }

    const { data: referrals } = await supabase
      .from('referrals')
      .select('id, created_at, wallet_credit')
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);

    setRecentReferrals((referrals as ReferralEntry[] | null) ?? []);

    const { count } = await supabase
      .from('referrals')
      .select('id', { count: 'exact', head: true })
      .eq('referrer_id', userId);

    setReferralCount(count ?? 0);

    return profileState;
  }

  async function loadPurchaseState(userId: string) {
    if (!supabase) {
      throw new Error('Supabase browser client is not configured.');
    }

    const { data: enrollmentRows, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('course_slug, progress, enrollment_status')
      .eq('user_id', userId)
      .in('enrollment_status', ['active', 'completed', 'pending']);

    if (enrollmentsError) {
      console.warn('Enrollment load failed', enrollmentsError);
    }

    const { data: paidOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, course_slug, metadata')
      .eq('user_id', userId)
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.warn('Paid orders load failed', ordersError);
    }

    const safeOrders = (paidOrders as DashboardOrderRow[] | null) ?? [];
    const orderIds = safeOrders.map((order) => order.id);

    let orderItems: DashboardOrderItemRow[] = [];

    if (orderIds.length > 0) {
      const { data: orderItemRows, error: orderItemsError } = await supabase
        .from('order_items')
        .select('order_id, item_type, item_slug')
        .in('order_id', orderIds);

      if (orderItemsError) {
        console.warn('Order items load failed', orderItemsError);
      } else {
        orderItems = (orderItemRows as DashboardOrderItemRow[] | null) ?? [];
      }
    }

    const ownedCourses = new Set<string>();
    const bundleSlugs = new Set<string>();
    const productSlugs = new Set<string>();
    const progressMap: Record<string, number> = {};
    const accessLinkMap = new Map<string, DeliveryAccessLink>();

    for (const enrollment of (enrollmentRows as EnrollmentRow[] | null) ?? []) {
      if (!enrollment.course_slug) {
        continue;
      }

      ownedCourses.add(enrollment.course_slug);
      progressMap[enrollment.course_slug] = Number(enrollment.progress ?? 0);
    }

    for (const order of safeOrders) {
      const matchedOrderItems = orderItems.filter((item) => item.order_id === order.id);

      for (const link of extractDeliveryAccessLinks(order.metadata)) {
        if (!accessLinkMap.has(link.url)) {
          accessLinkMap.set(link.url, link);
        }
      }

      if (matchedOrderItems.length > 0) {
        for (const item of matchedOrderItems) {
          if (item.item_type === 'course') {
            ownedCourses.add(item.item_slug);
            continue;
          }

          if (item.item_type === 'bundle') {
            bundleSlugs.add(item.item_slug);
            const bundle = BUNDLE_CATALOG.find((entry) => entry.slug === item.item_slug);

            for (const courseSlug of bundle?.includedCourseSlugs ?? []) {
              ownedCourses.add(courseSlug);
            }

            continue;
          }

          if (item.item_type === 'shop') {
            productSlugs.add(item.item_slug);
          }
        }

        continue;
      }

      if (!order.course_slug) {
        continue;
      }

      if (order.course_slug.startsWith('cart:')) {
        for (const item of decodeDashboardOrderItems(order.course_slug)) {
          if (item.type === 'course') {
            ownedCourses.add(item.slug);
            continue;
          }

          if (item.type === 'bundle') {
            bundleSlugs.add(item.slug);
            const bundle = BUNDLE_CATALOG.find((entry) => entry.slug === item.slug);

            for (const courseSlug of bundle?.includedCourseSlugs ?? []) {
              ownedCourses.add(courseSlug);
            }

            continue;
          }

          if (item.type === 'shop') {
            productSlugs.add(item.slug);
          }
        }

        continue;
      }

      const directCourse = COURSE_CATALOG.find((course) => course.slug === order.course_slug);

      if (directCourse) {
        ownedCourses.add(directCourse.slug);
      }
    }

    setOwnedCourseSlugs(Array.from(ownedCourses));
    setCourseProgressBySlug(progressMap);
    setPurchasedBundleSlugs(Array.from(bundleSlugs));
    setPurchasedProductSlugs(Array.from(productSlugs));
    setDeliveryAccessLinks(Array.from(accessLinkMap.values()));
  }

  function removeReferralParamFromUrl() {
    const url = new URL(window.location.href);

    if (url.searchParams.has('ref')) {
      url.searchParams.delete('ref');
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }

  async function applyReferralCode(code: string, userId: string, isAutoApply = false) {
    if (!supabase) {
      setReferralError('Supabase auth config missing.');
      return;
    }

    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      setReferralError('Referral code দিন।');
      return;
    }

    if (referralCode && normalizedCode === referralCode.trim().toUpperCase()) {
      setReferralError('নিজের referral code ব্যবহার করা যাবে না।');
      setReferralMessage('');
      return;
    }

    setIsApplyingReferral(true);
    setReferralError('');
    setReferralMessage('');

    const { data, error } = await supabase.rpc('claim_referral', {
      input_code: normalizedCode,
    });

    setIsApplyingReferral(false);

    if (error) {
      const errorMessage =
        error.message ||
        error.details ||
        error.hint ||
        error.code ||
        'Unknown referral error';
      const errorDetails = [error.details, error.hint, error.code].filter(Boolean).join(' | ');

      console.warn('claim_referral RPC failed', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      const normalizedError = errorMessage.toLowerCase();

      if (
        normalizedError.includes('function public.claim_referral') ||
        normalizedError.includes('function claim_referral') ||
        normalizedError.includes('column "referral_code"') ||
        normalizedError.includes('column "pending_referral_code"') ||
        normalizedError.includes('column "welcome_discount_uses_remaining"') ||
        normalizedError.includes('relation "public.referrals" does not exist')
      ) {
        setReferralError('Referral feature চালাতে Supabase referral migration run করতে হবে।');
        return;
      }

      setReferralError(
        errorDetails ? `Referral error: ${errorMessage} (${errorDetails})` : `Referral error: ${errorMessage}`,
      );
      return;
    }

    const result = Array.isArray(data) ? data[0] : null;

    if (!result?.success) {
      setReferralError(result?.message ?? 'Referral code apply করা যায়নি।');
      return;
    }

    setReferralInput('');
    setReferralMessage(result.message);
    await loadReferralState(userId, referralCode || buildFallbackReferralCode(userName, userEmail));

    if (isAutoApply || normalizedCode) {
      removeReferralParamFromUrl();
    }
  }

  async function copyReferralLink() {
    if (!referralCode) {
      return;
    }

    const referralLink = `${window.location.origin}/signup?ref=${encodeURIComponent(referralCode)}`;
    await navigator.clipboard.writeText(referralLink);
    setReferralMessage('Referral link copy হয়েছে।');
    setReferralError('');
  }

  async function copyPromoText() {
    if (!referralCode) {
      return;
    }

    const referralLink = `${window.location.origin}/signup?ref=${encodeURIComponent(referralCode)}`;
    const promoText = `দেশি কোর্সে join করলে প্রথম course-এ ১০% off পাবে। আমার referral link: ${referralLink}`;
    await navigator.clipboard.writeText(promoText);
    setReferralMessage('Promo text copy হয়েছে।');
    setReferralError('');
  }

  function handleInviteFriends() {
    if (!absoluteReferralLink) {
      setReferralError('Referral link ready হলে invite পাঠাতে পারবেন।');
      setReferralMessage('');
      return;
    }

    const recipients = inviteRecipients
      .split(/[,\s]+/)
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      setReferralError('একটি email address লিখুন।');
      setReferralMessage('');
      return;
    }

    const subject = encodeURIComponent('Deshi Course referral invitation');
    const body = encodeURIComponent(
      `Deshi Course-এ join করলে প্রথম course-এ ১০% off পাবে। আমার referral link: ${absoluteReferralLink}`,
    );

    window.location.href = `mailto:${recipients.join(',')}?subject=${subject}&body=${body}`;
    setReferralMessage('Email invite ready হয়েছে।');
    setReferralError('');
  }

  useEffect(() => {
    setAppOrigin(window.location.origin);
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');

    if (tab && ['all', 'owned', 'refer', 'shop', 'bundle', 'support'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileProfileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      if (isAuthLoading) {
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const referralFromUrl = params.get('ref')?.toUpperCase() ?? '';

      if (!user) {
        router.push('/signin?redirect=/dashboard');
        return;
      }

      if (!supabase) {
        setReferralError('Supabase public auth config missing. Dashboard unavailable.');
        return;
      }

      const displayName =
        (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
        (typeof user.user_metadata?.name === 'string' && user.user_metadata.name) ||
        user.email?.split('@')[0] ||
        'শিক্ষার্থী';
      const avatarUrl =
        (typeof user.user_metadata?.avatar_url === 'string' && user.user_metadata.avatar_url) ||
        (typeof user.user_metadata?.picture === 'string' && user.user_metadata.picture) ||
        undefined;

      if (!isMounted) {
        return;
      }

      setUserName(displayName);
      setUserEmail(user.email ?? '');
      setUserAvatar(resolveAvatarUrl(user.email ?? '', avatarUrl, displayName));
      setCurrentUserId(user.id);

      const fallbackCode = buildFallbackReferralCode(displayName, user.email ?? '');
      setReferralCode(fallbackCode);

      const [profileState] = await Promise.all([
        loadReferralState(user.id, fallbackCode),
        loadPurchaseState(user.id),
      ]);

      if (!isMounted) {
        return;
      }

      if (!profileState.referredBy) {
        const autoReferralCode = referralFromUrl || profileState.pendingReferralCode;

        if (autoReferralCode) {
          setReferralInput(autoReferralCode);
          await applyReferralCode(autoReferralCode, user.id, true);
        }
      } else if (referralFromUrl) {
        removeReferralParamFromUrl();
      }
    }

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, router, supabase, user]);

  async function handleSignOut() {
    if (!supabase) {
      router.push('/signin');
      return;
    }

    await supabase.auth.signOut();
    router.push('/signin');
    router.refresh();
  }

  const dashboardCourses = COURSE_CATALOG.map((course) => ({
    ...course,
    isOwned: ownedCourseSlugs.includes(course.slug),
    progress: courseProgressBySlug[course.slug] ?? course.progress,
  }));
  const dashboardBundles = BUNDLE_CATALOG.map((bundle) => ({
    ...bundle,
    isOwned: purchasedBundleSlugs.includes(bundle.slug),
  }));
  const dashboardProducts = SHOP_CATALOG.map((item) => ({
    ...item,
    isOwned: purchasedProductSlugs.includes(item.slug),
  }));

  const presetFilters: Array<{
    value: 'beginner' | 'intermediate' | 'advanced' | 'free';
    label: string;
  }> = [
    { value: 'beginner', label: 'beginner' },
    { value: 'intermediate', label: 'intermediate' },
    { value: 'advanced', label: 'advance' },
    { value: 'free', label: 'free' },
  ];

  const filteredCourses = dashboardCourses.filter(course => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const matchesSearch =
      normalizedSearch.length === 0 ||
      course.title.toLowerCase().includes(normalizedSearch) ||
      course.category.toLowerCase().includes(normalizedSearch);
    const matchesPreset =
      !selectedPresetFilter ||
      (selectedPresetFilter === 'free'
        ? course.price === 0
        : course.level === selectedPresetFilter);

    if (activeTab === 'owned') return matchesSearch && matchesPreset && course.isOwned;
    return matchesSearch && matchesPreset;
  });
  const samplePricing = getPricingPreview(100, walletBalance, welcomeDiscountUsesRemaining);
  const referralLink = referralCode ? `/signup?ref=${encodeURIComponent(referralCode)}` : '/signup';
  const absoluteReferralLink = appOrigin && referralCode ? `${appOrigin}${referralLink}` : '';
  const whatsappShareUrl = absoluteReferralLink
    ? `https://wa.me/?text=${encodeURIComponent(
        `দেশি কোর্সে join করলে প্রথম course-এ ১০% off পাবে। আমার referral link: ${absoluteReferralLink}`,
      )}`
    : '#';
  const facebookShareUrl = absoluteReferralLink
    ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(absoluteReferralLink)}`
    : '#';

  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col overflow-x-hidden lg:h-screen lg:flex-row lg:overflow-hidden">
      {!isConfigured && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Supabase public auth config missing. Dashboard and auth actions work করবে না যতক্ষণ না
          `NEXT_PUBLIC_SUPABASE_URL` এবং publishable key set করা হচ্ছে।
        </div>
      )}
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-4 sm:px-6 flex items-center justify-between flex-shrink-0">
        <BrandLogo size="sm" textClassName="text-lg" />
        <div ref={mobileMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsMobileProfileMenuOpen((open) => !open)}
            className="h-9 w-9 overflow-hidden rounded-full border border-brand/10 bg-brand/10"
            aria-label="Profile menu"
            aria-expanded={isMobileProfileMenuOpen}
          >
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-brand">
                <User className="w-5 h-5" />
              </div>
            )}
          </button>

          {isMobileProfileMenuOpen && (
            <div className="absolute right-0 top-12 z-50 w-48 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('refer');
                  setIsMobileProfileMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-brand/5 hover:text-brand"
              >
                <Gift className="h-4 w-4" />
                <span>রেফার</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMobileProfileMenuOpen(false);
                  void handleSignOut();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-500 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span>লগ আউট</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col flex-shrink-0">
        <div className="p-8">
          <BrandLogo />
        </div>

        <nav className="flex-grow px-4">
          <div className="space-y-1">
            <p className="px-4 pb-2 text-xs font-semibold uppercase text-gray-400">
              Learning
            </p>
            <button
              onClick={() => setActiveTab('owned')}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                activeTab === 'owned'
                  ? 'bg-brand/10 text-brand shadow-sm ring-1 ring-brand/10'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${activeTab === 'owned' ? 'text-brand' : 'text-gray-400'}`}>
                <CheckCircle className="h-5 w-5" />
              </span>
              <span className={`text-sm ${activeTab === 'owned' ? 'font-bold' : 'font-medium'}`}>আমার কোর্স</span>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                activeTab === 'all'
                  ? 'bg-brand/10 text-brand shadow-sm ring-1 ring-brand/10'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${activeTab === 'all' ? 'text-brand' : 'text-gray-400'}`}>
                <BookOpen className="h-5 w-5" />
              </span>
              <span className={`text-sm ${activeTab === 'all' ? 'font-bold' : 'font-medium'}`}>সব কোর্স</span>
            </button>
            <button
              onClick={() => setActiveTab('bundle')}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                activeTab === 'bundle'
                  ? 'bg-brand/10 text-brand shadow-sm ring-1 ring-brand/10'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${activeTab === 'bundle' ? 'text-brand' : 'text-gray-400'}`}>
                <Layers3 className="h-5 w-5" />
              </span>
              <span className={`text-sm ${activeTab === 'bundle' ? 'font-bold' : 'font-medium'}`}>বান্ডেল</span>
            </button>
            <button
              onClick={() => setActiveTab('shop')}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                activeTab === 'shop'
                  ? 'bg-brand/10 text-brand shadow-sm ring-1 ring-brand/10'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${activeTab === 'shop' ? 'text-brand' : 'text-gray-400'}`}>
                <Store className="h-5 w-5" />
              </span>
              <span className={`text-sm ${activeTab === 'shop' ? 'font-bold' : 'font-medium'}`}>প্রোডাক্ট</span>
            </button>
          </div>

          <div className="mt-6 border-t border-dashed border-gray-200 pt-6">
            <p className="px-4 pb-2 text-xs font-semibold uppercase text-gray-400">
              Growth
            </p>
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('refer')}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                  activeTab === 'refer'
                    ? 'bg-brand/10 text-brand shadow-sm ring-1 ring-brand/10'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${activeTab === 'refer' ? 'text-brand' : 'text-gray-400'}`}>
                  <Gift className="h-5 w-5" />
                </span>
                <span className={`text-sm ${activeTab === 'refer' ? 'font-bold' : 'font-medium'}`}>রেফার</span>
              </button>
              <button
                onClick={() => setActiveTab('support')}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                  activeTab === 'support'
                    ? 'bg-brand/10 text-brand shadow-sm ring-1 ring-brand/10'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${activeTab === 'support' ? 'text-brand' : 'text-gray-400'}`}>
                  <Headphones className="h-5 w-5" />
                </span>
                <span className={`text-sm ${activeTab === 'support' ? 'font-bold' : 'font-medium'}`}>সাপোর্ট</span>
              </button>
            </div>
          </div>
        </nav>

        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden pr-2">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-brand/10 bg-brand/10">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-brand">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-gray-900">{userName}</p>
                <p className="truncate text-xs text-gray-500">{userEmail || 'Supabase user'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50"
              aria-label="লগ আউট"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-4 pb-[calc(env(safe-area-inset-bottom)+8rem)] md:p-6 md:pb-[calc(env(safe-area-inset-bottom)+8.5rem)] lg:p-10 lg:pb-10">
        <header className="hidden lg:flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ড্যাশবোর্ড</h1>
            <p className="text-gray-500">স্বাগতম {userName}! আপনার শেখার যাত্রা চালিয়ে যান।</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-3">
              <div className="hidden xl:flex items-center gap-2">
                {presetFilters.map((filter) => {
                  const isActive = selectedPresetFilter === filter.value;

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setSelectedPresetFilter(isActive ? null : filter.value)}
                      className={`rounded-full border px-3 py-2 text-xs font-semibold capitalize transition ${
                        isActive
                          ? 'border-brand bg-brand text-white shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-brand/30 hover:text-brand'
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text"
                  placeholder="কোর্স খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition w-full md:w-64"
                />
              </div>
            </div>
            <div className="hidden xl:flex items-center gap-2 rounded-2xl bg-brand/10 px-4 py-2 text-brand">
              <Coins className="h-5 w-5" />
              <div>
                <p className="text-xs font-medium text-brand/70">ওয়ালেট</p>
                <p className="text-sm font-bold">৳ {formatPrice(walletBalance)}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Search Bar */}
        <div className="lg:hidden mb-6">
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {presetFilters.map((filter) => {
              const isActive = selectedPresetFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedPresetFilter(isActive ? null : filter.value)}
                  className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold capitalize transition ${
                    isActive
                      ? 'border-brand bg-brand text-white shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="কোর্স খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition w-full"
            />
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'support' ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">সাপোর্ট সেন্টার</h2>
                <p className="text-sm text-gray-500">যেকোনো কোর্স, লগইন বা payment issue হলে এখান থেকেই দ্রুত সহায়তা নিন।</p>
              </div>

              {deliveryAccessLinks.length > 0 && (
                <div className="rounded-[2rem] border border-green-100 bg-green-50/60 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">আপনার unlocked access</h3>
                      <p className="mt-1 text-sm text-gray-600">Paid order confirm হওয়ার পর যে channel/group/resource খুলেছে, সেগুলো এখানে পাবেন।</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-green-700">
                      {deliveryAccessLinks.length} access
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {deliveryAccessLinks.map((link) => (
                      <a
                        key={`${link.resource}-${link.url}`}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-2xl border border-white/80 bg-white px-4 py-4 text-sm transition hover:border-brand/20 hover:bg-brand/5"
                      >
                        <div>
                          <p className="font-bold text-gray-900">{link.label}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-gray-400">
                            {link.track} · {link.resource}
                          </p>
                        </div>
                        <span className="font-bold text-brand">Open</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">WhatsApp সাপোর্ট</h3>
                  <p className="text-gray-500 text-sm mb-4">দ্রুত reply-এর জন্য WhatsApp-এ message দিন। কোর্স, payment বা access issue এখানেই track করা হবে।</p>
                  <a
                    href="https://wa.me/8801813896400"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-brand hover:underline"
                  >
                    +880 1813-896400
                  </a>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">ইমেইল সাপোর্ট</h3>
                  <p className="text-gray-500 text-sm mb-4">যেকোনো টেকনিক্যাল সমস্যা, payment proof বা business inquiry-এর জন্য email করুন।</p>
                  <a
                    href="mailto:info@deshicourse.xyz"
                    className="font-bold text-brand hover:underline"
                  >
                    info@deshicourse.xyz
                  </a>
                </div>
              </div>

              <div className="flex flex-col rounded-[2rem] border border-brand/10 bg-brand/5 p-8">
                <h3 className="text-xl font-bold mb-4">আপনার কি কোনো বিশেষ সমস্যা হচ্ছে?</h3>
                <p className="text-gray-600 mb-6 text-sm">Messenger বা Facebook page-এ message দিলে support team দ্রুত follow-up করতে পারবে।</p>
                <div className="mt-auto flex justify-end">
                  <a
                    href="https://www.messenger.com/t/956128257564286"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-dark"
                  >
                    Messenger-এ যান
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-gray-100">
                <p className="text-sm font-bold text-brand">Quick Help</p>
                <h3 className="mt-2 text-xl font-bold text-gray-900">দ্রুত সমাধানের জন্য শর্টকাট</h3>
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm font-bold text-gray-900">কোর্স access পাচ্ছেন না?</p>
                    <p className="mt-1 text-sm text-gray-500">সাইন-ইন করা email দিয়ে purchase হয়েছে কি না আগে verify করুন, তারপর WhatsApp-এ order detail পাঠান।</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm font-bold text-gray-900">Google login সমস্যা?</p>
                    <p className="mt-1 text-sm text-gray-500">browser popup block করা থাকলে allow দিন, তারপরও না হলে Messenger-এ screenshot পাঠান।</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm font-bold text-gray-900">Bundle বা add-on order update?</p>
                    <p className="mt-1 text-sm text-gray-500">payment reference সহ WhatsApp বা email করলে order দ্রুত track করা যাবে।</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col rounded-[2rem] bg-gradient-to-br from-brand to-brand-dark p-6 text-white shadow-sm">
                <p className="text-sm text-white/70">Priority Support</p>
                <h3 className="mt-2 text-xl font-bold">লাইভ সহায়তা দরকার?</h3>
                <p className="mt-3 text-sm text-white/80">জরুরি access, payment বা dashboard issue হলে সরাসরি Deshi Course Facebook page বা contact page-এ যোগাযোগ করুন।</p>
                <div className="mt-auto flex justify-end pt-5">
                  <a
                    href="https://www.facebook.com/DeshiCourse"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-brand transition hover:bg-white/90"
                  >
                    Facebook page-এ যান
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'refer' ? (
          <div className="w-full space-y-6">
            <div className="overflow-hidden rounded-[2rem] border border-brand/10 bg-white shadow-sm">
              <div className="border-b border-brand/10 bg-[radial-gradient(circle_at_top_left,_rgba(109,40,217,0.12),_transparent_32%),linear-gradient(135deg,rgba(109,40,217,0.04),rgba(255,255,255,1)_58%,rgba(14,165,233,0.08))] px-6 py-6 md:px-8 md:py-8">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-sm font-semibold text-brand">Referrals</p>
                    <h2 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">বন্ধুকে invite করুন, দুজনেই value পান</h2>
                    <p className="mt-3 max-w-xl text-sm text-gray-600 md:text-base">
                      নতুন user আপনার link দিয়ে signup করলে প্রথম course-এ ১০% off পাবে, আর successful referral হলেই আপনার wallet-এ ৳{REFERRER_WALLET_CREDIT} credit যোগ হবে।
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
                    <div className="rounded-3xl border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur">
                      <p className="text-xs font-semibold text-gray-500">রেফারেল কোড</p>
                      <p className="mt-3 text-lg font-bold text-gray-900">{referralCode || 'Ready'}</p>
                    </div>
                    <div className="rounded-3xl border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur">
                      <p className="text-xs font-semibold text-gray-500">ওয়ালেট ব্যালেন্স</p>
                      <p className="mt-3 text-2xl font-bold text-gray-900">৳ {formatPrice(walletBalance)}</p>
                    </div>
                    <div className="rounded-3xl border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur">
                      <p className="text-xs font-semibold text-gray-500">রেফার সংখ্যা</p>
                      <p className="mt-3 text-2xl font-bold text-gray-900">{referralCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8 px-6 py-6 md:px-8 md:py-8">
                <div className="relative grid gap-4 lg:grid-cols-3">
                  <div className="absolute left-[16%] right-[16%] top-9 hidden border-t border-dashed border-brand/20 lg:block" />

                  <div className="relative rounded-3xl border border-gray-100 bg-gray-50/80 p-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                      <Mail className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-gray-900">Send invitation</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">আপনার referral link বন্ধুকে email, chat বা social post দিয়ে পাঠান।</p>
                  </div>

                  <div className="relative rounded-3xl border border-gray-100 bg-gray-50/80 p-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                      <UserPlus className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-gray-900">Registration</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">নতুন user signup করে code apply করলে first-purchase discount unlock হবে।</p>
                  </div>

                  <div className="relative rounded-3xl border border-gray-100 bg-gray-50/80 p-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                      <Coins className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-gray-900">Wallet reward</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">Successful referral-এর পরে আপনার wallet-এ reward credit জমা হবে।</p>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
                  <div className="space-y-6">
                    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900">Invite your friends</h3>
                      <p className="mt-2 text-sm leading-6 text-gray-500">বন্ধুদের email address দিন, mail app open হবে আর referral link ready body-তে বসে যাবে।</p>

                      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <input
                          type="text"
                          value={inviteRecipients}
                          onChange={(e) => setInviteRecipients(e.target.value)}
                          placeholder="Email address লিখুন"
                          className="w-full rounded-full border border-gray-200 bg-gray-50 px-5 py-3 text-sm outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                        />
                        <button
                          type="button"
                          onClick={handleInviteFriends}
                          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={!absoluteReferralLink}
                          aria-label="Send referral invite"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-brand/10 bg-brand/[0.03] p-5 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900">Share the referral link</h3>
                      <p className="mt-2 text-sm leading-6 text-gray-500">Link copy করে পাঠান বা নিচের quick share action use করুন।</p>

                      <div className="mt-5 rounded-[1.75rem] border border-brand/10 bg-white p-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <div className="min-w-0 flex-1 rounded-2xl bg-gray-50 px-4 py-3">
                            <p className="text-xs font-semibold text-gray-500">আপনার referral link</p>
                            <p className="mt-2 truncate text-sm font-medium text-gray-700">
                              {absoluteReferralLink || 'Link preparing হচ্ছে...'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={copyReferralLink}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={!referralCode}
                          >
                            <Copy className="h-4 w-4" />
                            Copy link
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <a
                          href={whatsappShareUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-disabled={!absoluteReferralLink}
                          className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand/10 bg-white text-brand transition hover:border-brand hover:bg-brand/5 ${absoluteReferralLink ? '' : 'pointer-events-none opacity-50'}`}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>
                        <a
                          href={facebookShareUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-disabled={!absoluteReferralLink}
                          className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand/10 bg-white text-brand transition hover:border-brand hover:bg-brand/5 ${absoluteReferralLink ? '' : 'pointer-events-none opacity-50'}`}
                        >
                          <Share2 className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          onClick={copyPromoText}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand/10 bg-white text-brand transition hover:border-brand hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={!referralCode}
                        >
                          <Link2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                          <TicketPercent className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Referral activation</p>
                          <h3 className="text-lg font-bold text-gray-900">Discount unlock overview</h3>
                        </div>
                      </div>

                      <div className="mt-5 rounded-3xl bg-gray-50 p-4 text-sm text-gray-600">
                        <div className="flex items-center justify-between gap-3">
                          <span>১০০ টাকার course example</span>
                          <span className="font-bold text-gray-900">৳ {formatPrice(samplePricing.finalPrice)}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-200 pt-3">
                          <span>Referral off</span>
                          <span className="font-bold text-brand">
                            {samplePricing.hasReferralDiscount
                              ? `- ৳ ${formatPrice(samplePricing.referralDiscount)}`
                              : `১০% off = ৳ ${(100 * REFERRAL_DISCOUNT_RATE).toFixed(0)}`}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-200 pt-3">
                          <span>Wallet use</span>
                          <span className="font-bold text-brand">
                            {samplePricing.hasWalletDiscount
                              ? `- ৳ ${formatPrice(samplePricing.walletDiscount)}`
                              : `referrer wallet-এ ৳${REFERRER_WALLET_CREDIT}`}
                          </span>
                        </div>
                      </div>

                      {referredBy ? (
                        <div className="mt-5 rounded-3xl border border-green-100 bg-green-50 px-4 py-4 text-sm leading-6 text-green-700">
                          আপনার account-এ referral already active আছে। নতুন course-এ discount preview এখনই দেখতে পারবেন।
                        </div>
                      ) : (
                        <div className="mt-5 space-y-3">
                          <label className="block text-sm font-bold text-gray-700">Referral code apply করুন</label>
                          <div className="flex flex-col gap-3 sm:flex-row">
                            <input
                              type="text"
                              value={referralInput}
                              onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                              className="w-full rounded-full border border-gray-200 bg-gray-50 px-5 py-3 uppercase outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20"
                              placeholder="Referral code লিখুন"
                            />
                            <button
                              type="button"
                              onClick={() => void applyReferralCode(referralInput, currentUserId)}
                              className="rounded-full bg-brand px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
                              disabled={isApplyingReferral || !currentUserId}
                            >
                              {isApplyingReferral ? 'Apply হচ্ছে...' : 'Apply করুন'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900">Referral status</h3>
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                          <span>Own code ready</span>
                          <span className="font-bold text-brand">{referralCode ? 'Ready' : 'Preparing'}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                          <span>First-purchase off</span>
                          <span className="font-bold text-brand">
                            {welcomeDiscountUsesRemaining > 0 ? 'Active' : 'Available after valid referral'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                          <span>Wallet spendable</span>
                          <span className="font-bold text-brand">৳ {formatPrice(walletBalance)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {referralError && (
                  <div className="rounded-3xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {referralError}
                  </div>
                )}

                {referralMessage && (
                  <div className="rounded-3xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {referralMessage}
                  </div>
                )}

                <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Latest reward activity</h3>
                      <p className="mt-1 text-sm text-gray-500">সাম্প্রতিক referral reward এখানে দেখাবে।</p>
                    </div>
                    <div className="hidden rounded-full bg-brand/10 px-4 py-2 text-sm font-bold text-brand sm:inline-flex">
                      {referralCount} referral
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {recentReferrals.length > 0 ? (
                      recentReferrals.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between rounded-3xl border border-gray-100 bg-gray-50 px-4 py-4 text-sm">
                          <div>
                            <p className="font-bold text-gray-900">Referral reward credited</p>
                            <p className="mt-1 text-gray-500">{new Date(entry.created_at).toLocaleDateString('en-GB')}</p>
                          </div>
                          <span className="font-bold text-brand">+ ৳ {formatPrice(entry.wallet_credit)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                        এখনো কোনো referral reward যোগ হয়নি।
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'shop' ? (
          <div className="w-full space-y-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {dashboardProducts.map((item) => (
                <article key={item.id} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-xl">
                  <div className="relative h-28 sm:h-48">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      unoptimized={item.image.startsWith('/api/catalog-art')}
                      referrerPolicy="no-referrer"
                    />
                    {item.tag && (
                      <span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold text-white sm:left-4 sm:top-4 sm:px-3 sm:text-xs">
                        {item.tag}
                      </span>
                    )}
                    {item.isOwned && (
                      <span className="absolute right-3 top-3 rounded-full bg-green-500 px-2.5 py-1 text-[10px] font-bold text-white sm:right-4 sm:top-4 sm:px-3 sm:text-xs">
                        Purchased
                      </span>
                    )}
                  </div>
                  <div className="flex grow flex-col p-3 sm:p-6">
                    <h3 className="mb-2 line-clamp-2 text-sm font-bold leading-snug sm:mb-3 sm:text-xl">{item.title}</h3>
                    <ul className="mb-4 space-y-1.5 text-[11px] leading-4 text-gray-600 sm:mb-6 sm:space-y-2 sm:text-sm sm:leading-5">
                      {item.featureMetrics.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <Check className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-brand" />
                          <span className="line-clamp-2">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] text-gray-400 sm:text-xs">{item.format}</p>
                        <p className="text-lg font-bold text-gray-900 sm:text-2xl">৳{item.price}</p>
                      </div>
                      <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-end">
                        <Link
                          href={`/templates/${item.slug}`}
                          className={`min-w-0 rounded-lg px-2 py-2 text-center text-[11px] font-bold transition sm:w-auto sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm ${
                            item.isOwned
                              ? 'bg-green-50 text-green-700 hover:bg-green-100'
                              : 'bg-brand px-2 text-white hover:bg-brand-dark'
                          }`}
                        >
                          <span className="sm:hidden">{item.isOwned ? 'ওপেন' : 'দেখুন'}</span>
                          <span className="hidden sm:inline">{item.isOwned ? 'রিসোর্স খুলুন' : 'বিস্তারিত দেখুন'}</span>
                        </Link>
                        {item.isOwned ? (
                          <div className="flex items-center justify-center rounded-lg border border-green-100 bg-green-50 px-2 py-2 text-center text-[11px] font-bold text-green-700 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm">
                            Already purchased
                          </div>
                        ) : (
                          <AddToCartButton
                            item={{ type: 'shop', slug: item.slug }}
                            className="min-w-0 w-full px-2 py-2 text-[11px] sm:w-auto sm:px-4 sm:py-2 sm:text-sm"
                            defaultLabel="কার্টে যোগ করুন"
                            addedLabel="কার্টে আছে"
                            mobileLabel="কার্টে"
                            mobileAddedLabel="আছে"
                            hideIconOnMobile
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : activeTab === 'bundle' ? (
          <div className="w-full space-y-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {dashboardBundles.map((bundle) => (
                <article key={bundle.id} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-xl">
                  <div className="relative h-28 sm:h-48">
                    <Image
                      src={bundle.image}
                      alt={bundle.title}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {bundle.tag && (
                      <span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold text-white sm:left-4 sm:top-4 sm:px-3 sm:text-xs">
                        {bundle.tag}
                      </span>
                    )}
                    {bundle.isOwned && (
                      <span className="absolute right-3 top-3 rounded-full bg-green-500 px-2.5 py-1 text-[10px] font-bold text-white sm:right-4 sm:top-4 sm:px-3 sm:text-xs">
                        Purchased
                      </span>
                    )}
                  </div>
                  <div className="flex grow flex-col p-3 sm:p-6">
                    <h3 className="mb-2 line-clamp-2 text-sm font-bold leading-snug sm:mb-3 sm:text-xl">{bundle.title}</h3>
                    <ul className="mb-4 space-y-1.5 text-[11px] leading-4 text-gray-600 sm:mb-6 sm:space-y-2 sm:text-sm sm:leading-5">
                      {bundle.featureMetrics.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <Check className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-brand" />
                          <span className="line-clamp-2">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        {bundle.originalPrice > bundle.bundlePrice && (
                          <p className="text-[10px] text-gray-400 line-through sm:text-xs">৳{bundle.originalPrice}</p>
                        )}
                        <p className="text-lg font-bold text-gray-900 sm:text-2xl">৳{bundle.bundlePrice}</p>
                      </div>
                      <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-end">
                        <Link
                          href={`/bundles/${bundle.slug}`}
                          className={`min-w-0 rounded-lg px-2 py-2 text-center text-[11px] font-bold transition sm:w-auto sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm ${
                            bundle.isOwned
                              ? 'bg-green-50 text-green-700 hover:bg-green-100'
                              : 'bg-brand text-white hover:bg-brand-dark'
                          }`}
                        >
                          <span className="sm:hidden">{bundle.isOwned ? 'ওপেন' : 'দেখুন'}</span>
                          <span className="hidden sm:inline">{bundle.isOwned ? 'বান্ডেল খুলুন' : 'বিস্তারিত দেখুন'}</span>
                        </Link>
                        {bundle.isOwned ? (
                          <div className="flex items-center justify-center rounded-lg border border-green-100 bg-green-50 px-2 py-2 text-center text-[11px] font-bold text-green-700 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm">
                            Already purchased
                          </div>
                        ) : (
                          <AddToCartButton
                            item={{ type: 'bundle', slug: bundle.slug }}
                            className="min-w-0 w-full px-2 py-2 text-[11px] sm:w-auto sm:px-4 sm:py-2 sm:text-sm"
                            defaultLabel="কার্টে যোগ করুন"
                            addedLabel="কার্টে আছে"
                            mobileLabel="কার্টে"
                            mobileAddedLabel="আছে"
                            hideIconOnMobile
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Course Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:gap-8 xl:grid-cols-3">
              {filteredCourses.map((course) => (
                <motion.div 
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition flex flex-col"
                >
                  <div className="relative h-28 sm:h-40">
                    <Image 
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover"
                      unoptimized={course.image.startsWith('/api/catalog-art')}
                      referrerPolicy="no-referrer"
                    />
                    <div className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold sm:left-4 sm:top-4 sm:px-3 sm:text-xs ${courseLevelMeta[course.level].className}`}>
                      {courseLevelMeta[course.level].label}
                    </div>
                    {course.promoTag && (
                      <div
                        className="absolute right-2 top-2 inline-flex h-[58px] w-[58px] -rotate-12 items-center justify-center border-2 border-white bg-[#ef4444] px-2 text-center text-[8px] font-black uppercase leading-tight tracking-[0.08em] text-white shadow-[0_10px_24px_rgba(15,23,42,0.28)] sm:right-4 sm:top-4 sm:h-[72px] sm:w-[72px] sm:text-[9px]"
                        style={{ clipPath: 'polygon(50% 0%, 60% 18%, 78% 6%, 74% 26%, 94% 22%, 82% 40%, 100% 50%, 82% 60%, 94% 78%, 74% 74%, 78% 94%, 60% 82%, 50% 100%, 40% 82%, 22% 94%, 26% 74%, 6% 78%, 18% 60%, 0% 50%, 18% 40%, 6% 22%, 26% 26%, 22% 6%, 40% 18%)' }}
                      >
                        {course.promoTag}
                      </div>
                    )}
                    {course.isOwned && (
                      <div className="absolute bottom-3 right-3 flex items-center space-x-1 rounded-full bg-green-500 px-2 py-1 text-[10px] font-bold text-white">
                        <CheckCircle className="w-3 h-3" />
                        <span>Owned</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-grow flex-col p-3 sm:p-5">
                    <h3 className="mb-2 line-clamp-2 text-sm font-bold leading-snug sm:text-lg">{course.title}</h3>
                    <p className="mb-3 text-[11px] text-gray-500 sm:mb-4 sm:text-sm">{course.instructor}</p>
                    
                    <div className="mt-auto">
                      {course.isOwned ? (
                        <div className="space-y-3">
                          <Link
                            href={`/courses/${course.slug}`}
                            className="block w-full rounded-lg bg-brand py-2 text-center text-xs font-bold text-white transition hover:bg-brand-dark sm:rounded-xl sm:py-2.5 sm:text-sm"
                          >
                            চালিয়ে যান
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center text-[11px] text-gray-400 sm:text-xs">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{course.accessLabel}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <Link
                              href={`/courses/${course.slug}`}
                              className="block min-w-0 w-full rounded-lg bg-brand/10 px-2 py-2 text-center text-[11px] font-bold text-brand transition hover:bg-brand hover:text-white sm:rounded-xl sm:py-2.5 sm:text-sm"
                            >
                              <span className="sm:hidden">দেখুন</span>
                              <span className="hidden sm:inline">বিস্তারিত দেখুন</span>
                            </Link>
                            <AddToCartButton
                              item={{ type: 'course', slug: course.slug }}
                              className="min-w-0 w-full px-2 py-2 text-[11px] sm:text-sm"
                              defaultLabel="কার্টে যোগ করুন"
                              addedLabel="কার্টে আছে"
                              mobileLabel="কার্টে"
                              mobileAddedLabel="আছে"
                              hideIconOnMobile
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-20">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">কোনো কোর্স পাওয়া যায়নি</h3>
                <p className="text-gray-500">অন্য কোনো নাম দিয়ে চেষ্টা করুন।</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 gap-1 border-t border-gray-100 bg-white/98 px-2 py-2 shadow-[0_-12px_30px_-24px_rgba(15,23,42,0.35)] backdrop-blur"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.5rem)' }}
      >
        <button 
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex min-h-[60px] w-full flex-col items-center justify-center gap-1 rounded-xl transition ${activeTab === 'all' ? 'bg-brand/8 text-brand' : 'text-gray-400 hover:bg-gray-50'}`}
        >
          <BookOpen className="w-6 h-6" />
          <span className="text-[10px] font-medium">সব কোর্স</span>
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('owned')}
          className={`flex min-h-[60px] w-full flex-col items-center justify-center gap-1 rounded-xl transition ${activeTab === 'owned' ? 'bg-brand/8 text-brand' : 'text-gray-400 hover:bg-gray-50'}`}
        >
          <CheckCircle className="w-6 h-6" />
          <span className="text-[10px] font-medium">আমার কোর্স</span>
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('support')}
          className={`flex min-h-[60px] w-full flex-col items-center justify-center gap-1 rounded-xl transition ${activeTab === 'support' ? 'bg-brand/8 text-brand' : 'text-gray-400 hover:bg-gray-50'}`}
        >
          <Headphones className="w-6 h-6" />
          <span className="text-[10px] font-medium">সাপোর্ট</span>
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('shop')}
          className={`flex min-h-[60px] w-full flex-col items-center justify-center gap-1 rounded-xl transition ${activeTab === 'shop' ? 'bg-brand/8 text-brand' : 'text-gray-400 hover:bg-gray-50'}`}
        >
          <Store className="w-6 h-6" />
          <span className="text-[10px] font-medium">প্রোডাক্ট</span>
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('bundle')}
          className={`flex min-h-[60px] w-full flex-col items-center justify-center gap-1 rounded-xl transition ${activeTab === 'bundle' ? 'bg-brand/8 text-brand' : 'text-gray-400 hover:bg-gray-50'}`}
        >
          <Layers3 className="w-6 h-6" />
          <span className="text-[10px] font-medium">বান্ডেল</span>
        </button>
      </nav>
    </div>
  );
}
